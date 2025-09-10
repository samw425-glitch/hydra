#!/usr/bin/env python3
"""
evergreen_content_manager.py
Termux-ready content manager:
- Auto-posts every 10 min
- Logs actions
- Saves posts in SQLite
- Supports multiple modes: --view, --logs, --reload
"""

import sqlite3
import time
import random
import subprocess
import os
import sys
from datetime import datetime

DB_FILE = "evergreen.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    print("✅ Database ready (posts, logs)")

def log_action(action):
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("INSERT INTO logs (action) VALUES (?)", (action,))
    conn.commit()
    conn.close()

def add_post(content):
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("INSERT INTO posts (content) VALUES (?)", (content,))
    conn.commit()
    conn.close()
    log_action(f"Post added: {content[:30]}...")
    print(f"[{datetime.now()}] 📢 {content}")

def view_posts(limit=10):
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT id, content, created_at FROM posts ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cur.fetchall()
    conn.close()

    if not rows:
        print("📭 No posts yet.")
        return

    print("\n📜 Last posts:\n")
    for r in rows:
        print(f"📝 {r[1]} (added {r[2]})")

def view_logs(limit=10):
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT id, action, timestamp FROM logs ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cur.fetchall()
    conn.close()

    if not rows:
        print("📭 No logs yet.")
        return

    print("\n📒 Last logs:\n")
    for r in rows:
        print(f"🔖 {r[1]} (at {r[2]})")

def reload_script():
    print("♻️ Reloading script...")
    python_exec = sys.executable
    os.execv(python_exec, [python_exec] + sys.argv)

def main():
    print(f"[{datetime.now()}] 🚀 Evergreen Content Manager started")
    while True:
        # Example demo post — replace with your real rotation logic
        post_content = "Demo post"
        add_post(post_content)
        time.sleep(600)  # 10 minutes

if __name__ == "__main__":
    init_db()
    if "--view" in sys.argv:
        view_posts()
    elif "--logs" in sys.argv:
        view_logs()
    elif "--reload" in sys.argv:
        reload_script()
    else:
        main()
