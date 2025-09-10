```bash
#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
# Evergreen Content Manager - Universal Setup Script
# Enhanced for Termux and cross-platform compatibility
# Author: Sam 🐻🚀
# ============================================================

set -e  # Exit on error

# Detect platform and set paths accordingly
if [ -d "/data/data/com.termux/files/usr" ]; then
    # Termux environment
    PROJECT_DIR="$HOME/evergreen_content_manager"
    PYTHON_CMD="python3"
else
    # Standard Linux environment
    PROJECT_DIR="${HOME}/evergreen_content_manager"
    PYTHON_CMD="python3"
    # Check if python3 is available, fall back to python
    if ! command -v python3 &> /dev/null; then
        PYTHON_CMD="python"
    fi
fi

BACKUP_DIR="$HOME/git_backup_$(date +%Y%m%d_%H%M%S)"
DB_FILE="$PROJECT_DIR/evergreen_content_manager.db"
INIT_DB="$PROJECT_DIR/init_db.py"

echo "🔍 Setting up Evergreen Content Manager..."

# Create project directory if it doesn't exist
if [ ! -d "$PROJECT_DIR" ]; then
    echo "📁 Creating project directory: $PROJECT_DIR"
    mkdir -p "$PROJECT_DIR"
fi

echo "📁 Changing to project directory: $PROJECT_DIR"
cd "$PROJECT_DIR" || { echo "❌ Failed to access project directory!"; exit 1; }

# Step 1: Backup any existing Git configuration
if [ -d ".git" ]; then
    echo "📦 Backing up existing Git repo to $BACKUP_DIR ..."
    mkdir -p "$BACKUP_DIR"
    cp -r .git "$BACKUP_DIR/" 2>/dev/null || true
    echo "✅ Backup complete."
fi

# Step 2: Initialize new repo
echo "🌀 Initializing fresh Git repo..."
rm -rf .git
git init

# Step 3: Create comprehensive .gitignore
cat > .gitignore <<'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
env.bak/
venv.bak/

# Database
*.db
*.sqlite
*.sqlite3

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# OS/Editor
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
*.swp
*.swo
*~

# Termux specific
termux/
EOF

echo "✅ .gitignore created."

# Step 4: Add init_db.py for automatic schema creation
cat > "$INIT_DB" <<'PYCODE'
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
PYCODE

# Make init script executable
chmod +x "$INIT_DB"

# Step 5: Initialize the DB
echo "🗄️  Initializing database..."
$PYTHON_CMD "$INIT_DB"

# Step 6: Create a basic main.py if it doesn't exist
if [ ! -f "main.py" ]; then
    cat > main.py <<'PYCODE'
#!/usr/bin/env python3
"""
Evergreen Content Manager - Main Application
"""
import sqlite3
import os
from init_db import init_database

def main():
    # Ensure database is initialized
    init_database()
    
    print("🌿 Evergreen Content Manager")
    print("Database is ready at: evergreen_content_manager.db")
    
    # Add your application logic here

if __name__ == "__main__":
    main()
PYCODE
    echo "✅ Created main.py with database initialization"
fi

# Step 7: First commit
echo "📝 Creating initial commit..."
git add .
git commit -m "✨ Initial commit: Project setup with DB schema" || \
    echo "⚠️  Note: Could not create initial commit (might be due to empty repo or missing git config)"

# Step 8: Set up remote if desired
echo -n "🌐 Do you want to set up a remote GitHub repository? (y/N): "
read -r setup_remote
if [ "$setup_remote" = "y" ] || [ "$setup_remote" = "Y" ]; then
    echo -n "Enter your GitHub repo URL: "
    read -r REPO_URL
    git remote add origin "$REPO_URL" 2>/dev/null || \
        git remote set-url origin "$REPO_URL"
    
    echo -n "Do you want to push to the remote now? (y/N): "
    read -r push_now
    if [ "$push_now" = "y" ] || [ "$push_now" = "Y" ]; then
        git branch -M main
        git push -u origin main || echo "⚠️  Push failed - check your remote URL and network connection"
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo "   Project location: $PROJECT_DIR"
echo "   Database file: $DB_FILE"
echo "   Run: cd $PROJECT_DIR && $PYTHON_CMD main.py"
echo ""
```
