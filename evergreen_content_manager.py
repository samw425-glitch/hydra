#!/usr/bin/env python3
"""
evergreen_content_manager.py
Termux-ready: auto-post 10 posts every 10 min, rotate IONOS links,
log activity, save to SQLite, and push safely to GitHub.
"""

import sqlite3
import time
import random
import subprocess
import os
from datetime import datetime

# Config
POSTS_PER_BATCH = 10
BATCH_INTERVAL_MINUTES = 10
GITHUB_REPO = "https://github.com/samwglitch-425/evergreen_content_manager.git"
DB_FILE = os.path.expanduser("~/evergreen_content_manager.db")
LOG_FILE = os.path.expanduser("~/evergreen_content_manager.log")

IONOS_LINKS = [
    "https://aklam.io/dBGH0D",
    "https://aklam.io/kES0IW",
    "https://aklam.io/mK87TQ",
    "https://aklam.io/ryR0Jy",
    "https://aklam.io/pctkSY",
    "https://aklam.io/nEROz8"
]

TOPICS = ["business", "technology", "productivity", "tools", "efficiency"]
TEMPLATES = [
    "💡 Daily Tip: {topic} insight to boost your workflow! | {link}"
]

# --- Setup ---
if not os.path.exists(DB_FILE):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT,
            link TEXT,
            timestamp TEXT
        )
    ''')
    conn.commit()
    conn.close()

# --- Logging ---
def log(message):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a") as f:
        f.write(f"[{ts}] {message}\n")
    print(f"[{ts}] {message}")

# --- Generate posts ---
def generate_posts():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    for _ in range(POSTS_PER_BATCH):
        topic = random.choice(TOPICS)
        link = random.choice(IONOS_LINKS)
        template = random.choice(TEMPLATES)
        content = template.format(topic=topic, link=link)
        timestamp = datetime.now().isoformat()
        c.execute("INSERT INTO posts (content, link, timestamp) VALUES (?, ?, ?)",
                  (content, link, timestamp))
        log(f"Saved post: {content}")
    conn.commit()
    conn.close()

# --- Git push ---
def push_to_github():
    try:
        subprocess.run(f"git add -A", shell=True, check=True)
        subprocess.run(f'git commit -m "Auto-update: new posts"', shell=True, check=True)
        subprocess.run(f"git push -u origin main", shell=True, check=True)
        log("Pushed updates to GitHub")
    except subprocess.CalledProcessError:
        log("No changes to push or Git push failed")

# --- Main loop ---
log("Evergreen Content Manager started")
while True:
    generate_posts()
    push_to_github()
    log(f"Batch complete, sleeping {BATCH_INTERVAL_MINUTES} minutes...")
    time.sleep(BATCH_INTERVAL_MINUTES * 60)
