# ~/dev/hydra/api1/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import time

app = Flask(__name__)
CORS(app)  # Allow frontend to fetch data across containers

# In-memory storage for live data
live_users = []

# Endpoint to add new users (POST)
@app.route('/users', methods=['POST'])
def add_user():
    data = request.json
    if not data or 'user' not in data:
        return jsonify({'error': 'No user provided'}), 400
    user = data['user']
    live_users.append(user)
    return jsonify({'status': 'success', 'user': user}), 201

# Endpoint to get current users (GET)
@app.route('/users', methods=['GET'])
def get_users():
    return jsonify({'users': live_users})

# Optional: auto-remove users older than X seconds
# (useful if you want a live dashboard that decays old data)
def cleanup_loop():
    while True:
        time.sleep(60)  # every 60 seconds
        if live_users:
            live_users.pop(0)  # remove oldest entry

# Uncomment to enable automatic cleanup
# threading.Thread(target=cleanup_loop, daemon=True).start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True)
