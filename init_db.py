#!/usr/bin/env python3
import sqlite3
import os
import sys

DB_PATH = "evergreen_content_manager.db"

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

def init_database():
    try:
        db_needs_init = not os.path.exists(DB_PATH)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        if db_needs_init:
            print(f"🗄️  Creating new database: {DB_PATH}")
        else:
            print(f"🔎 Ensuring database schema exists: {DB_PATH}")
        
        cursor.executescript(schema)
        conn.commit()
        
        # Verify tables were created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND (name='posts' OR name='logs')")
        tables = cursor.fetchall()
        
        if len(tables) == 2:
            print("✅ Database is ready with tables: posts, logs")
        else:
            print("⚠️  Warning: Some tables might not have been created properly")
            
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    init_database()
