#!/usr/bin/env python3
"""
GistGhost - Distributed Cognitive Node for the Hydra Network

A decentralized intelligence framework that automates creation, learning,
and marketing through interconnected GitHub Gists.
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Any
import datetime
import uuid

from gist import Gist
from github_client import GitHubClient
from index_manager import IndexManager

class GistGhost:
    """Main GistGhost application class."""
    
    def __init__(self, config_dir: Optional[Path] = None):
        """Initialize GistGhost with configuration."""
        self.config_dir = config_dir or Path.home() / ".gistghost"
        self.config_dir.mkdir(exist_ok=True)
        
        self.config_file = self.config_dir / "config.json"
        self.index_file = self.config_dir / "index.json"
        
        self.config = self._load_config()
        self.github_client = GitHubClient(self.config.get("github_token"))
        self.index_manager = IndexManager(self.index_file)
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file or environment."""
        config = {}
        
        if self.config_file.exists():
            with open(self.config_file, 'r') as f:
                config = json.load(f)
        
        # Override with environment variables
        if os.getenv('GITHUB_TOKEN'):
            config['github_token'] = os.getenv('GITHUB_TOKEN')
        
        # Default values
        config.setdefault('origin_hydra', 'gistghost-local')
        config.setdefault('default_priority', 5)
        
        return config
    
    def _save_config(self):
        """Save current configuration to file."""
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def setup(self, github_token: str, origin_hydra: Optional[str] = None):
        """Initial setup of GistGhost."""
        self.config['github_token'] = github_token
        if origin_hydra:
            self.config['origin_hydra'] = origin_hydra
        
        self._save_config()
        self.github_client = GitHubClient(github_token)
        
        print("🧠 GistGhost initialized successfully!")
        print(f"   Origin Hydra: {self.config['origin_hydra']}")
        print(f"   Config stored: {self.config_file}")
        print(f"   Index location: {self.index_file}")
    
    def create_thought(self, content: str, intent: str, priority: int = None, 
                      file_format: str = "md", filename: Optional[str] = None) -> str:
        """Create a new thought Gist."""
        if not self.config.get('github_token'):
            raise ValueError("GitHub token not configured. Run 'gistghost setup' first.")
        
        priority = priority or self.config.get('default_priority', 5)
        
        # Create Gist object
        gist = Gist(
            origin_hydra=self.config['origin_hydra'],
            intent=intent,
            priority=priority,
            content=content,
            file_format=file_format,
            filename=filename
        )
        
        # Create on GitHub
        gist_data = self.github_client.create_gist(gist)
        gist_id = gist_data['id']
        gist.gist_id = gist_id
        
        # Update local index
        self.index_manager.add_gist(gist)
        
        print(f"💫 Created thought: {gist_id}")
        print(f"   Intent: {intent}")
        print(f"   Priority: {priority}")
        print(f"   URL: {gist_data['html_url']}")
        
        return gist_id
    
    def evolve_thought(self, gist_id: str, new_content: Optional[str] = None,
                      new_intent: Optional[str] = None) -> str:
        """Evolve an existing thought by creating a child Gist."""
        # Get parent gist from index
        parent_gist = self.index_manager.get_gist(gist_id)
        if not parent_gist:
            raise ValueError(f"Gist {gist_id} not found in local index")
        
        # Create evolved version
        evolved_gist = parent_gist.evolve(
            new_content=new_content,
            new_intent=new_intent or f"Evolution of: {parent_gist.intent}"
        )
        
        # Create on GitHub
        gist_data = self.github_client.create_gist(evolved_gist)
        new_gist_id = gist_data['id']
        evolved_gist.gist_id = new_gist_id
        
        # Update parent status to complete
        parent_gist.status = "complete"
        self.github_client.update_gist(parent_gist)
        
        # Update index
        self.index_manager.update_gist(parent_gist)
        self.index_manager.add_gist(evolved_gist)
        
        print(f"🔄 Evolved thought: {new_gist_id}")
        print(f"   Parent: {gist_id}")
        print(f"   New Intent: {evolved_gist.intent}")
        print(f"   URL: {gist_data['html_url']}")
        
        return new_gist_id
    
    def link_thoughts(self, gist_id_1: str, gist_id_2: str, relationship: str = "related"):
        """Create a semantic link between two thoughts."""
        self.index_manager.link_gists(gist_id_1, gist_id_2, relationship)
        
        print(f"🔗 Linked thoughts:")
        print(f"   {gist_id_1} -> {gist_id_2}")
        print(f"   Relationship: {relationship}")
    
    def list_thoughts(self, status_filter: Optional[str] = None, 
                     limit: int = 10) -> List[Dict]:
        """List thoughts from the index."""
        thoughts = self.index_manager.list_gists(status_filter, limit)
        
        if not thoughts:
            print("🤔 No thoughts found")
            return []
        
        print(f"🧠 Recent thoughts ({len(thoughts)}):")
        print("-" * 80)
        
        for thought in thoughts:
            status_emoji = {
                "new": "✨",
                "processing": "⚡",
                "complete": "✅",
                "evolving": "🔄"
            }.get(thought.get('status', 'new'), "❓")
            
            print(f"{status_emoji} {thought['gist_id'][:8]}... | {thought['intent']}")
            print(f"   Priority: {thought['priority']} | {thought['timestamp']}")
            if thought.get('parent_gist'):
                print(f"   Parent: {thought['parent_gist'][:8]}...")
            print()
        
        return thoughts
    
    def show_network(self):
        """Show the thought network structure."""
        network = self.index_manager.get_network_stats()
        
        print("🌐 Thought Network Status:")
        print(f"   Total thoughts: {network['total_thoughts']}")
        print(f"   Active thoughts: {network['active_thoughts']}")
        print(f"   Completed thoughts: {network['completed_thoughts']}")
        print(f"   Evolution chains: {network['evolution_chains']}")
        print(f"   Semantic links: {network['semantic_links']}")

def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="GistGhost - Distributed Cognitive Node",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
🧠 HYDRA NETWORK PROTOCOL ACTIVE 🧠

Examples:
  gistghost setup --token ghp_xxxx --origin my-hydra-node
  gistghost create --intent "Market research" --content "Analysis of..."
  gistghost evolve abc123def --content "Updated analysis..."
  gistghost link abc123def xyz789abc --relationship "builds-on"
  gistghost list --status active
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Setup command
    setup_parser = subparsers.add_parser('setup', help='Initial configuration')
    setup_parser.add_argument('--token', required=True, help='GitHub Personal Access Token')
    setup_parser.add_argument('--origin', help='Origin Hydra identifier')
    
    # Create command
    create_parser = subparsers.add_parser('create', help='Create new thought')
    create_parser.add_argument('--intent', required=True, help='Thought intent/purpose')
    create_parser.add_argument('--content', help='Thought content (or stdin)')
    create_parser.add_argument('--priority', type=int, default=5, help='Priority (1-10)')
    create_parser.add_argument('--format', choices=['md', 'json', 'txt'], default='md', help='File format')
    create_parser.add_argument('--filename', help='Custom filename')
    
    # Evolve command
    evolve_parser = subparsers.add_parser('evolve', help='Evolve existing thought')
    evolve_parser.add_argument('gist_id', help='Parent gist ID')
    evolve_parser.add_argument('--content', help='New content (or stdin)')
    evolve_parser.add_argument('--intent', help='New intent')
    
    # Link command
    link_parser = subparsers.add_parser('link', help='Link two thoughts')
    link_parser.add_argument('gist_id_1', help='First gist ID')
    link_parser.add_argument('gist_id_2', help='Second gist ID')
    link_parser.add_argument('--relationship', default='related', help='Relationship type')
    
    # List command
    list_parser = subparsers.add_parser('list', help='List thoughts')
    list_parser.add_argument('--status', choices=['new', 'processing', 'complete', 'evolving'], help='Filter by status')
    list_parser.add_argument('--limit', type=int, default=10, help='Max results')
    
    # Network command
    network_parser = subparsers.add_parser('network', help='Show network status')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    ghost = GistGhost()
    
    try:
        if args.command == 'setup':
            ghost.setup(args.token, args.origin)
        
        elif args.command == 'create':
            content = args.content
            if not content:
                # Read from stdin if no content provided
                content = sys.stdin.read().strip()
                if not content:
                    print("Error: No content provided")
                    return
            
            ghost.create_thought(
                content=content,
                intent=args.intent,
                priority=args.priority,
                file_format=args.format,
                filename=args.filename
            )
        
        elif args.command == 'evolve':
            content = args.content
            if not content:
                content = sys.stdin.read().strip()
            
            ghost.evolve_thought(
                gist_id=args.gist_id,
                new_content=content if content else None,
                new_intent=args.intent
            )
        
        elif args.command == 'link':
            ghost.link_thoughts(args.gist_id_1, args.gist_id_2, args.relationship)
        
        elif args.command == 'list':
            ghost.list_thoughts(args.status, args.limit)
        
        elif args.command == 'network':
            ghost.show_network()
    
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()