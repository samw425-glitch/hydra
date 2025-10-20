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
