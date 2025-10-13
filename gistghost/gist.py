"""
Gist class for managing thought cells with Hydra Network metadata.
"""

import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional


class Gist:
    """Represents a single thought cell in the Hydra Network."""
    
    def __init__(
        self,
        origin_hydra: str,
        intent: str,
        priority: int = 5,
        content: str = "",
        file_format: str = "md",
        filename: Optional[str] = None,
        parent_gist: Optional[str] = None,
        version: str = "1.0.0",
        status: str = "new",
        gist_id: Optional[str] = None,
        timestamp: Optional[str] = None
    ):
        """Initialize a new Gist thought cell."""
        self.gist_id = gist_id
        self.origin_hydra = origin_hydra
        self.intent = intent
        self.priority = max(1, min(10, priority))  # Clamp between 1-10
        self.content = content
        self.file_format = file_format
        self.filename = filename or self._generate_filename()
        self.parent_gist = parent_gist
        self.version = version
        self.status = status
        self.timestamp = timestamp or datetime.now(timezone.utc).isoformat()
        self.node_id = str(uuid.uuid4())
    
    def _generate_filename(self) -> str:
        """Generate a filename based on intent and format."""
        # Clean intent for filename
        safe_intent = "".join(c for c in self.intent.lower() if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_intent = safe_intent.replace(' ', '_')[:50]  # Limit length
        
        extension = {
            'md': '.md',
            'json': '.json',
            'txt': '.txt'
        }.get(self.file_format, '.md')
        
        return f"{safe_intent}_thought{extension}"
    
    def get_metadata_header(self) -> str:
        """Generate the metadata header for the gist content."""
        metadata = {
            "origin_hydra": self.origin_hydra,
            "intent": self.intent,
            "priority": self.priority,
            "timestamp": self.timestamp,
            "version": self.version,
            "status": self.status,
            "node_id": self.node_id
        }
        
        if self.parent_gist:
            metadata["parent_gist"] = self.parent_gist
        
        if self.file_format == 'json':
            # For JSON files, embed metadata in the structure
            return json.dumps({
                "metadata": metadata,
                "content": self.content
            }, indent=2)
        else:
            # For Markdown/text files, use frontmatter-style header
            header_lines = ["---", "# Hydra Network Metadata"]
            for key, value in metadata.items():
                header_lines.append(f"{key}: {json.dumps(value)}")
            header_lines.extend(["---", ""])
            return "\n".join(header_lines)
    
    def get_full_content(self) -> str:
        """Get the complete gist content including metadata."""
        if self.file_format == 'json':
            return self.get_metadata_header()
        else:
            return self.get_metadata_header() + self.content
    
    def to_github_format(self) -> Dict[str, Any]:
        """Convert to GitHub Gist API format."""
        return {
            "description": f"🧠 {self.intent} | Hydra: {self.origin_hydra}",
            "public": False,  # Private by default for security
            "files": {
                self.filename: {
                    "content": self.get_full_content()
                }
            }
        }
    
    def evolve(self, new_content: Optional[str] = None, new_intent: Optional[str] = None) -> 'Gist':
        """Create an evolved version of this thought."""
        # Increment version
        version_parts = self.version.split('.')
        if len(version_parts) == 3:
            version_parts[1] = str(int(version_parts[1]) + 1)
            new_version = '.'.join(version_parts)
        else:
            new_version = "1.1.0"
        
        evolved = Gist(
            origin_hydra=self.origin_hydra,
            intent=new_intent or f"Evolution of: {self.intent}",
            priority=self.priority,
            content=new_content or self.content,
            file_format=self.file_format,
            parent_gist=self.gist_id,
            version=new_version,
            status="evolving"
        )
        
        return evolved
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "gist_id": self.gist_id,
            "origin_hydra": self.origin_hydra,
            "intent": self.intent,
            "priority": self.priority,
            "content": self.content,
            "file_format": self.file_format,
            "filename": self.filename,
            "parent_gist": self.parent_gist,
            "version": self.version,
            "status": self.status,
            "timestamp": self.timestamp,
            "node_id": self.node_id
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Gist':
        """Create Gist instance from dictionary."""
        return cls(**data)
    
    @classmethod
    def from_github_gist(cls, gist_data: Dict[str, Any]) -> Optional['Gist']:
        """Parse a GitHub gist and extract Hydra metadata."""
        try:
            # Get the first file from the gist
            files = gist_data.get('files', {})
            if not files:
                return None
            
            first_file = next(iter(files.values()))
            content = first_file.get('content', '')
            
            # Try to parse metadata from content
            if content.startswith('---'):
                # Frontmatter style
                lines = content.split('\n')
                metadata = {}
                in_metadata = False
                content_start = 0
                
                for i, line in enumerate(lines):
                    if line.strip() == '---':
                        if not in_metadata:
                            in_metadata = True
                        else:
                            content_start = i + 1
                            break
                    elif in_metadata and ':' in line:
                        key, value = line.split(':', 1)
                        try:
                            metadata[key.strip()] = json.loads(value.strip())
                        except json.JSONDecodeError:
                            metadata[key.strip()] = value.strip()
                
                actual_content = '\n'.join(lines[content_start:])
                
            elif content.strip().startswith('{'):
                # JSON format
                try:
                    data = json.loads(content)
                    metadata = data.get('metadata', {})
                    actual_content = data.get('content', '')
                except json.JSONDecodeError:
                    return None
            else:
                # No metadata found, create basic gist
                metadata = {}
                actual_content = content
            
            # Extract metadata with defaults
            return cls(
                gist_id=gist_data['id'],
                origin_hydra=metadata.get('origin_hydra', 'unknown'),
                intent=metadata.get('intent', gist_data.get('description', 'Unknown intent')),
                priority=metadata.get('priority', 5),
                content=actual_content,
                file_format=metadata.get('file_format', 'md'),
                filename=first_file.get('filename', 'thought.md'),
                parent_gist=metadata.get('parent_gist'),
                version=metadata.get('version', '1.0.0'),
                status=metadata.get('status', 'new'),
                timestamp=metadata.get('timestamp', gist_data.get('created_at'))
            )
            
        except Exception as e:
            print(f"Warning: Could not parse gist {gist_data.get('id')}: {e}")
            return None
    
    def update_status(self, new_status: str):
        """Update the thought status."""
        valid_statuses = ['new', 'processing', 'complete', 'evolving']
        if new_status in valid_statuses:
            self.status = new_status
            self.timestamp = datetime.now(timezone.utc).isoformat()
        else:
            raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")
    
    def __str__(self) -> str:
        """String representation of the thought."""
        return f"Gist({self.gist_id or 'new'}): {self.intent} [{self.status}]"
    
    def __repr__(self) -> str:
        """Developer representation of the thought."""
        return f"Gist(gist_id='{self.gist_id}', intent='{self.intent}', status='{self.status}')"