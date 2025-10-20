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
