#!/usr/bin/env python3
"""
Evergreen Content Manager
Auto-posting + DB self-healing + logging
"""

import sqlite3
import os
import time
from datetime import datetime

DB_PATH = "evergreen_content_manager.db"

# --- Step 1: Ensure DB schema exists ---
def init_db():
    schema = """
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        posted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.executescript(schema)
    conn.commit()
    conn.close()
    print("✅ Database ready (posts, logs)")

# --- Step 2: Logging helper ---
def log_message(message: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO logs (message) VALUES (?)", (message,))
    conn.commit()
    conn.close()
    print(f"[{datetime.now()}] {message}")

# --- Step 3: Example workflow (stub) ---
def auto_post():
    # Example demo post (replace with your automation logic)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO posts (title, content) VALUES (?, ?)",
                   ("Demo Title", "This is a demo content post."))
    conn.commit()
    conn.close()
    log_message("📢 Demo post added to DB.")

# --- Main loop ---
if __name__ == "__main__":
    init_db()
    log_message("🚀 Evergreen Content Manager started")

    while True:
        auto_post()
        time.sleep(600)  # every 10 minutes
