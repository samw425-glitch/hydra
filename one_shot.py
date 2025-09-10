
#!/usr/bin/env python3
import random
import hashlib
import sqlite3
import os
from datetime import datetime, timedelta
from dataclasses import dataclass

# --- Config ---
AFFILIATE_LINKS = {
    "ionos": "https://www.ionos.com/affiliate?ref=XXXX",
    "hostinger": "https://www.hostinger.com/affiliate?ref=XXXX",
    "blueface": "https://www.blueface.com/affiliate?ref=XXXX"
}

CONTENT_TEMPLATES = [
    {"type": "insight", "template": "💡 Daily Insight: {content}", "topics": ["productivity", "business", "technology"]},
    {"type": "tip", "template": "🔧 Pro Tip: {content}", "topics": ["tools", "efficiency", "workflow"]},
    {"type": "update", "template": "📢 Update: {content}", "topics": ["news", "announcements", "features"]}
]

CONTENT_LIBRARY = {
    "productivity": [
        "Use time-blocking to increase focus and reduce task-switching overhead",
        "Implement the two-minute rule: if it takes less than two minutes, do it now",
        "Create templates for recurring tasks to save time and maintain consistency"
    ],
    "technology": [
        "Automate repetitive workflows using no-code tools and integrations",
        "Regular software updates improve security and often add useful features",
        "Cloud storage enables seamless collaboration across devices and teams"
    ],
    "business": [
        "Document processes to ensure knowledge transfer and operational consistency",
        "Regular customer feedback helps identify improvement opportunities",
        "Data-driven decisions reduce bias and improve outcome predictability"
    ]
}

DB_FILE = "content.db"

@dataclass
class ContentItem:
    content: str
    topic: str
    scheduled_time: datetime
    content_id: int = None

# --- Database Setup ---
os.makedirs(os.path.dirname(DB_FILE) if os.path.dirname(DB_FILE) else ".", exist_ok=True)
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()
cursor.execute('''
CREATE TABLE IF NOT EXISTS content_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_hash TEXT UNIQUE,
    content TEXT,
    topic TEXT,
    created_at TEXT,
    scheduled_at TEXT
)
''')
conn.commit()

# --- Helper Functions ---
def generate_content_item():
    template = random.choice(CONTENT_TEMPLATES)
    topic = random.choice(template["topics"])
    content_text = random.choice(CONTENT_LIBRARY[topic])
    formatted_content = template["template"].format(content=content_text)

    # Append a random affiliate link
    formatted_content += f"\n\nCheck this out: {random.choice(list(AFFILIATE_LINKS.values()))}"
    return ContentItem(content=formatted_content, topic=topic, scheduled_time=datetime.now())

def generate_content_hash(content: str) -> str:
    return hashlib.md5(content.encode()).hexdigest()

def save_content_item(item: ContentItem):
    content_hash = generate_content_hash(item.content)
    try:
        cursor.execute('''
            INSERT INTO content_items (content_hash, content, topic, created_at, scheduled_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (content_hash, item.content, item.topic, datetime.now().isoformat(), item.scheduled_time.isoformat()))
        conn.commit()
        item.content_id = cursor.lastrowid
        print(f"✅ Content saved (ID {item.content_id}):\n{item.content}\n")
    except sqlite3.IntegrityError:
        print("⚠️ Duplicate content detected, skipping.")

# --- One-Shot Execution ---
if __name__ == "__main__":
    item = generate_content_item()
    save_content_item(item)
    conn.close()

