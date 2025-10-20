#!/bin/bash
set -euo pipefail

echo "Creating Hydra project structure..."

# Base directories
mkdir -p hydra/api1 hydra/api2 hydra/website/js hydra/website/css

# ---------------- API1 ----------------
cat > hydra/api1/app.py <<'EOF'
from flask import Flask, request, jsonify
import csv, os
app = Flask(__name__)
CSV_FILE = "../topics.csv"

def load_topics():
    if not os.path.exists(CSV_FILE):
        return []
    with open(CSV_FILE,newline='') as f:
        reader = csv.DictReader(f)
        return list(reader)

@app.route("/topics", methods=["GET"])
def get_topics():
    return jsonify(load_topics())

@app.route("/topics", methods=["POST"])
def add_topic():
    data = request.json
    if data and "topic" in data and "category" in data:
        topics = load_topics()
        topics.append({"topic":data["topic"],"category":data["category"]})
        with open(CSV_FILE,"w",newline='') as f:
            writer = csv.DictWriter(f, fieldnames=["topic","category"])
            writer.writeheader()
            writer.writerows(topics)
        return jsonify({"status":"ok"}),201
    return jsonify({"error":"Invalid input"}),400

if __name__=="__main__":
    app.run(host="0.0.0.0", port=4000)
EOF

cat > hydra/api1/requirements.txt <<'EOF'
flask
EOF

cat > hydra/api1/Dockerfile <<'EOF'
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]
EOF

# ---------------- API2 ----------------
cat > hydra/api2/app.py <<'EOF'
from flask import Flask, request, jsonify
import subprocess, json, os
app = Flask(__name__)
CONTENT_FILE = "content.json"
content_store = json.load(open(CONTENT_FILE)) if os.path.exists(CONTENT_FILE) else []

@app.route("/generated", methods=["GET"])
def get_content():
    topic = request.args.get("topic")
    if topic:
        for c in content_store:
            if c["topic"] == topic:
                return jsonify(c)
        return jsonify({"topic":topic,"content":"Not generated yet"})
    return jsonify(content_store)

@app.route("/generate", methods=["POST"])
def generate_content():
    data = request.json
    if data and "topic" in data:
        topic_name = data["topic"]
        # Call LLaMA CCP locally
        result = subprocess.run(
            ["./llama.ccp","--prompt",f"Write an article about {topic_name}","--length","300"],
            capture_output=True, text=True
        )
        content = result.stdout.strip()
        content_store.append({"topic":topic_name,"content":content})
        json.dump(content_store, open(CONTENT_FILE,"w"))
        return jsonify({"status":"ok","topic":topic_name})
    return jsonify({"error":"Invalid input"}),400

if __name__=="__main__":
    # Auto-generate content for existing CSV topics
    import csv
    topics_file = "../topics.csv"
    if os.path.exists(topics_file):
        with open(topics_file,newline='') as f:
            reader = csv.DictReader(f)
            for t in reader:
                if not any(c["topic"]==t["topic"] for c in content_store):
                    subprocess.run(["./llama.ccp","--prompt",f"Write an article about {t['topic']}","--length","300"], capture_output=True)
    app.run(host="0.0.0.0", port=4001)
EOF

cat > hydra/api2/requirements.txt <<'EOF'
flask
EOF

cat > hydra/api2/Dockerfile <<'EOF'
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]
EOF

# ---------------- Website ----------------
cat > hydra/website/index.html <<'EOF'
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Hydra Dashboard</title>
<link rel="stylesheet" href="css/styles.css">
</head>
<body>
<h1>Hydra Live Content Dashboard</h1>
<div id="topics-container"></div>
<script src="js/main.js"></script>
</body>
</html>
EOF

cat > hydra/website/js/main.js <<'EOF'
async function fetchJson(url){
  try{const res=await fetch(url); if(!res.ok) throw new Error(res.status); return await res.json();}
  catch(e){console.error(e); return [];}
}
async function loadTopics(){
  const topics = await fetchJson("http://localhost:41000/topics");
  const container = document.getElementById("topics-container");
  container.innerHTML="";
  topics.forEach(async t=>{
    const div=document.createElement("div");
    div.className="topic";
    div.innerHTML=`<h3>${t.topic}</h3><p id="content-${t.topic}">Loading...</p>`;
    container.appendChild(div);
    const content = await fetchJson(`http://localhost:41001/generated?topic=${encodeURIComponent(t.topic)}`);
    document.getElementById(`content-${t.topic}`).innerText = content.content;
  });
}
setInterval(loadTopics,30000);
window.onload = loadTopics;
EOF

cat > hydra/website/css/styles.css <<'EOF'
body { font-family: Arial,sans-serif; padding:20px; background:#f5f5f5;}
h1 { text-align:center; }
.topic { background:white; padding:15px; margin:10px; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1);}
EOF

cat > hydra/website/nginx.conf <<'EOF'
server {
    listen 3000;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    location / { try_files $uri /index.html; }
    location /api1/ { proxy_pass http://hydra-api1:4000/; proxy_http_version 1.1; }
    location /api2/ { proxy_pass http://hydra-api2:4001/; proxy_http_version 1.1; }
}
EOF

cat > hydra/website/Dockerfile <<'EOF'
FROM nginx:stable-alpine
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EOF

# ---------------- Docker Compose ----------------
cat > hydra/docker-compose.yml <<'EOF'
services:
  hydra-api1:
    build: ./api1
    container_name: hydra-api1
    ports:
      - "41000:4000"
  hydra-api2:
    build: ./api2
    container_name: hydra-api2
    ports:
      - "41001:4001"
  hydra-website:
    build: ./website
    container_name: hydra-website
    ports:
      - "3000:3000"
    depends_on:
      - hydra-api1
      - hydra-api2
EOF

# ---------------- CSV with sample topics ----------------
cat > hydra/topics.csv <<'EOF'
topic,category
Hydra Automation,Tech
AI Content Generation,AI
Docker Orchestration,DevOps
EOF

echo "✅ Hydra stack scaffold with live content generation created!"
