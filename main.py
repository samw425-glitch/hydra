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
