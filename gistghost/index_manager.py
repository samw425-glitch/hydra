"""
Local index manager for GistGhost thought network.
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
from gist import Gist


class IndexManager:
    """Manages local index of thoughts and their relationships."""
    
    def __init__(self, index_file: Path):
        """Initialize index manager."""
        self.index_file = index_file
        self.index = self._load_index()
    
    def _load_index(self) -> Dict[str, Any]:
        """Load index from file or create empty one."""
        if self.index_file.exists():
            try:
                with open(self.index_file, 'r', encoding='utf-8') as f:
                    index = json.load(f)
                    
                # Ensure all required sections exist
                index.setdefault('thoughts', {})
                index.setdefault('relationships', {})
                index.setdefault('metadata', {
                    'version': '1.0.0',
                    'created_at': datetime.utcnow().isoformat(),
                    'last_updated': datetime.utcnow().isoformat(),
                    'total_thoughts': 0,
                    'evolution_chains': 0
                })
                
                return index
                
            except (json.JSONDecodeError, IOError) as e:
                print(f"Warning: Could not load index file, creating new one: {e}")
        
        # Create empty index
        return {
            'thoughts': {},
            'relationships': {},
            'metadata': {
                'version': '1.0.0',
                'created_at': datetime.utcnow().isoformat(),
                'last_updated': datetime.utcnow().isoformat(),
                'total_thoughts': 0,
                'evolution_chains': 0
            }
        }
    
    def _save_index(self):
        """Save index to file."""
        # Update metadata
        self.index['metadata']['last_updated'] = datetime.utcnow().isoformat()
        self.index['metadata']['total_thoughts'] = len(self.index['thoughts'])
        
        # Create directory if it doesn't exist
        self.index_file.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            with open(self.index_file, 'w', encoding='utf-8') as f:
                json.dump(self.index, f, indent=2, ensure_ascii=False)
        except IOError as e:
            print(f"Warning: Could not save index file: {e}")
    
    def add_gist(self, gist: Gist):
        """Add a gist to the index."""
        if not gist.gist_id:
            raise ValueError("Gist must have an ID to be indexed")
        
        gist_data = gist.to_dict()
        self.index['thoughts'][gist.gist_id] = gist_data
        
        # If this is an evolution, track the relationship
        if gist.parent_gist:
            self._add_evolution_relationship(gist.parent_gist, gist.gist_id)
        
        self._save_index()
    
    def update_gist(self, gist: Gist):
        """Update an existing gist in the index."""
        if not gist.gist_id:
            raise ValueError("Gist must have an ID to be updated")
        
        if gist.gist_id in self.index['thoughts']:
            self.index['thoughts'][gist.gist_id] = gist.to_dict()
            self._save_index()
        else:
            print(f"Warning: Gist {gist.gist_id} not found in index")
    
    def get_gist(self, gist_id: str) -> Optional[Gist]:
        """Retrieve a gist from the index."""
        gist_data = self.index['thoughts'].get(gist_id)
        if gist_data:
            return Gist.from_dict(gist_data)
        return None
    
    def remove_gist(self, gist_id: str):
        """Remove a gist from the index (use sparingly)."""
        if gist_id in self.index['thoughts']:
            del self.index['thoughts'][gist_id]
            
            # Clean up relationships
            self._remove_all_relationships(gist_id)
            
            self._save_index()
    
    def list_gists(self, status_filter: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """List gists from the index with optional filtering."""
        thoughts = list(self.index['thoughts'].values())
        
        # Filter by status if specified
        if status_filter:
            thoughts = [t for t in thoughts if t.get('status') == status_filter]
        
        # Sort by timestamp (newest first)
        thoughts.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        return thoughts[:limit]
    
    def link_gists(self, gist_id_1: str, gist_id_2: str, relationship: str = "related"):
        """Create a semantic link between two gists."""
        # Validate both gists exist
        if gist_id_1 not in self.index['thoughts'] or gist_id_2 not in self.index['thoughts']:
            raise ValueError("Both gists must exist in the index before linking")
        
        # Create bidirectional relationship
        self._add_relationship(gist_id_1, gist_id_2, relationship)
        self._add_relationship(gist_id_2, gist_id_1, f"reverse_{relationship}")
        
        self._save_index()
    
    def _add_relationship(self, from_gist: str, to_gist: str, relationship_type: str):
        """Add a relationship between two gists."""
        if from_gist not in self.index['relationships']:
            self.index['relationships'][from_gist] = []
        
        # Check if relationship already exists
        for rel in self.index['relationships'][from_gist]:
            if rel['to'] == to_gist and rel['type'] == relationship_type:
                return  # Relationship already exists
        
        self.index['relationships'][from_gist].append({
            'to': to_gist,
            'type': relationship_type,
            'created_at': datetime.utcnow().isoformat()
        })
    
    def _add_evolution_relationship(self, parent_id: str, child_id: str):
        """Add an evolution relationship."""
        self._add_relationship(parent_id, child_id, "evolved_to")
        self._add_relationship(child_id, parent_id, "evolved_from")
        
        # Update evolution chain count
        self.index['metadata']['evolution_chains'] = len(self.get_evolution_chains())
    
    def _remove_all_relationships(self, gist_id: str):
        """Remove all relationships involving a specific gist."""
        # Remove outgoing relationships
        if gist_id in self.index['relationships']:
            del self.index['relationships'][gist_id]
        
        # Remove incoming relationships
        for source_gist, relationships in self.index['relationships'].items():
            self.index['relationships'][source_gist] = [
                rel for rel in relationships if rel['to'] != gist_id
            ]
        
        # Clean up empty relationship lists
        empty_keys = [
            key for key, rels in self.index['relationships'].items() 
            if not rels
        ]
        for key in empty_keys:
            del self.index['relationships'][key]
    
    def get_related_gists(self, gist_id: str) -> List[Dict[str, Any]]:
        """Get all gists related to the given gist."""
        relationships = self.index['relationships'].get(gist_id, [])
        related_gists = []
        
        for rel in relationships:
            related_gist_data = self.index['thoughts'].get(rel['to'])
            if related_gist_data:
                related_gists.append({
                    'gist': related_gist_data,
                    'relationship': rel['type'],
                    'created_at': rel['created_at']
                })
        
        return related_gists
    
    def get_evolution_chain(self, gist_id: str) -> List[str]:
        """Get the full evolution chain for a gist."""
        # Find the root of the chain
        current_id = gist_id
        while True:
            parents = [
                rel['to'] for rel in self.index['relationships'].get(current_id, [])
                if rel['type'] == 'evolved_from'
            ]
            if not parents:
                break
            current_id = parents[0]  # Take first parent
        
        # Build forward chain from root
        chain = [current_id]
        while True:
            children = [
                rel['to'] for rel in self.index['relationships'].get(current_id, [])
                if rel['type'] == 'evolved_to'
            ]
            if not children:
                break
            current_id = children[0]  # Take first child
            chain.append(current_id)
        
        return chain
    
    def get_evolution_chains(self) -> List[List[str]]:
        """Get all evolution chains in the network."""
        chains = []
        processed_gists = set()
        
        for gist_id in self.index['thoughts']:
            if gist_id in processed_gists:
                continue
            
            # Check if this is a root or part of a chain
            has_parent = any(
                rel['type'] == 'evolved_from'
                for rel in self.index['relationships'].get(gist_id, [])
            )
            
            if not has_parent:
                # This is a root, build the chain
                chain = self.get_evolution_chain(gist_id)
                if len(chain) > 1:  # Only include actual chains
                    chains.append(chain)
                    processed_gists.update(chain)
        
        return chains
    
    def search_thoughts(self, query: str, fields: List[str] = None) -> List[Dict[str, Any]]:
        """Search thoughts by content."""
        if fields is None:
            fields = ['intent', 'content', 'origin_hydra']
        
        query_lower = query.lower()
        matching_thoughts = []
        
        for gist_data in self.index['thoughts'].values():
            for field in fields:
                field_value = str(gist_data.get(field, '')).lower()
                if query_lower in field_value:
                    matching_thoughts.append(gist_data)
                    break  # Avoid duplicate matches
        
        # Sort by timestamp (newest first)
        matching_thoughts.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        return matching_thoughts
    
    def get_network_stats(self) -> Dict[str, Any]:
        """Get network statistics."""
        thoughts = self.index['thoughts']
        relationships = self.index['relationships']
        
        status_counts = {}
        for thought in thoughts.values():
            status = thought.get('status', 'unknown')
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Count semantic links (excluding evolution relationships)
        semantic_links = 0
        for rels in relationships.values():
            semantic_links += len([
                rel for rel in rels 
                if not rel['type'].startswith('evolved_')
            ])
        
        evolution_chains = self.get_evolution_chains()
        
        return {
            'total_thoughts': len(thoughts),
            'active_thoughts': status_counts.get('new', 0) + status_counts.get('processing', 0),
            'completed_thoughts': status_counts.get('complete', 0),
            'evolving_thoughts': status_counts.get('evolving', 0),
            'evolution_chains': len(evolution_chains),
            'semantic_links': semantic_links // 2,  # Divide by 2 for bidirectional links
            'status_breakdown': status_counts,
            'avg_chain_length': (
                sum(len(chain) for chain in evolution_chains) / len(evolution_chains)
                if evolution_chains else 0
            )
        }
    
    def export_network(self, format_type: str = 'json') -> str:
        """Export the entire network in various formats."""
        if format_type == 'json':
            return json.dumps(self.index, indent=2)
        elif format_type == 'dot':
            # GraphViz DOT format for visualization
            lines = ['digraph GistGhost {']
            lines.append('  node [shape=box];')
            
            # Add nodes
            for gist_id, gist_data in self.index['thoughts'].items():
                label = gist_data.get('intent', 'Unknown')[:30]
                status = gist_data.get('status', 'unknown')
                color = {
                    'new': 'lightblue',
                    'processing': 'yellow',
                    'complete': 'lightgreen',
                    'evolving': 'orange'
                }.get(status, 'gray')
                
                lines.append(f'  "{gist_id}" [label="{label}" fillcolor="{color}" style="filled"];')
            
            # Add relationships
            for from_gist, relationships in self.index['relationships'].items():
                for rel in relationships:
                    if rel['type'] in ['evolved_to', 'related']:
                        style = 'solid' if rel['type'] == 'evolved_to' else 'dashed'
                        lines.append(f'  "{from_gist}" -> "{rel["to"]}" [style="{style}"];')
            
            lines.append('}')
            return '\n'.join(lines)
        else:
            raise ValueError(f"Unsupported export format: {format_type}")
    
    def backup_index(self, backup_path: Path):
        """Create a backup of the current index."""
        backup_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(self.index, f, indent=2, ensure_ascii=False)
    
    def restore_index(self, backup_path: Path):
        """Restore index from backup."""
        if not backup_path.exists():
            raise FileNotFoundError(f"Backup file not found: {backup_path}")
        
        with open(backup_path, 'r', encoding='utf-8') as f:
            self.index = json.load(f)
        
        self._save_index()