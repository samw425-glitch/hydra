"""
GitHub API client for GistGhost operations.
"""

import json
import requests
from typing import Dict, Any, List, Optional
from gist import Gist


class GitHubClient:
    """GitHub API client for managing Gists."""
    
    BASE_URL = "https://api.github.com"
    
    def __init__(self, token: Optional[str] = None):
        """Initialize GitHub client with authentication token."""
        self.token = token
        self.session = requests.Session()
        
        if token:
            self.session.headers.update({
                'Authorization': f'token {token}',
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'GistGhost/1.0.0'
            })
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Make authenticated request to GitHub API."""
        if not self.token:
            raise ValueError("GitHub token is required for API operations")
        
        url = f"{self.BASE_URL}{endpoint}"
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, params=data)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data)
            elif method.upper() == 'PATCH':
                response = self.session.patch(url, json=data)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            # Handle rate limiting
            if response.status_code == 403 and 'rate limit' in response.text.lower():
                raise Exception("GitHub API rate limit exceeded. Please try again later.")
            
            # Handle other errors
            if not response.ok:
                error_msg = f"GitHub API error ({response.status_code}): {response.text}"
                raise Exception(error_msg)
            
            return response.json() if response.content else {}
            
        except requests.RequestException as e:
            raise Exception(f"Network error: {e}")
    
    def test_authentication(self) -> Dict[str, Any]:
        """Test if the authentication token is valid."""
        try:
            user_data = self._make_request('GET', '/user')
            return {
                'valid': True,
                'username': user_data.get('login'),
                'name': user_data.get('name'),
                'email': user_data.get('email')
            }
        except Exception as e:
            return {
                'valid': False,
                'error': str(e)
            }
    
    def create_gist(self, gist: Gist) -> Dict[str, Any]:
        """Create a new gist on GitHub."""
        gist_data = gist.to_github_format()
        
        response = self._make_request('POST', '/gists', gist_data)
        
        return {
            'id': response['id'],
            'html_url': response['html_url'],
            'git_pull_url': response['git_pull_url'],
            'git_push_url': response['git_push_url'],
            'created_at': response['created_at'],
            'updated_at': response['updated_at']
        }
    
    def update_gist(self, gist: Gist) -> Dict[str, Any]:
        """Update an existing gist on GitHub."""
        if not gist.gist_id:
            raise ValueError("Gist ID is required for updates")
        
        gist_data = gist.to_github_format()
        # Remove description from updates to avoid conflicts
        gist_data.pop('public', None)
        
        response = self._make_request('PATCH', f'/gists/{gist.gist_id}', gist_data)
        
        return {
            'id': response['id'],
            'html_url': response['html_url'],
            'updated_at': response['updated_at']
        }
    
    def get_gist(self, gist_id: str) -> Optional[Gist]:
        """Retrieve a gist from GitHub and parse it."""
        try:
            gist_data = self._make_request('GET', f'/gists/{gist_id}')
            return Gist.from_github_gist(gist_data)
        except Exception as e:
            print(f"Failed to retrieve gist {gist_id}: {e}")
            return None
    
    def list_user_gists(self, per_page: int = 30, page: int = 1) -> List[Dict[str, Any]]:
        """List all gists for the authenticated user."""
        params = {
            'per_page': min(100, per_page),  # GitHub max is 100
            'page': page
        }
        
        try:
            gists = self._make_request('GET', '/gists', params)
            
            # Filter for Hydra Network gists
            hydra_gists = []
            for gist_data in gists:
                description = gist_data.get('description', '')
                if '🧠' in description and 'Hydra:' in description:
                    gist = Gist.from_github_gist(gist_data)
                    if gist:
                        hydra_gists.append(gist.to_dict())
            
            return hydra_gists
            
        except Exception as e:
            print(f"Failed to list gists: {e}")
            return []
    
    def delete_gist(self, gist_id: str) -> bool:
        """Delete a gist (use with caution - violates never delete principle)."""
        try:
            self._make_request('DELETE', f'/gists/{gist_id}')
            return True
        except Exception as e:
            print(f"Failed to delete gist {gist_id}: {e}")
            return False
    
    def search_gists_by_content(self, query: str, max_results: int = 50) -> List[Dict[str, Any]]:
        """Search through user's gists for content matches."""
        # Note: GitHub doesn't provide native gist search, so we fetch and filter locally
        all_gists = []
        page = 1
        
        while len(all_gists) < max_results:
            gists_page = self.list_user_gists(per_page=30, page=page)
            if not gists_page:
                break
            
            all_gists.extend(gists_page)
            page += 1
            
            # Avoid infinite loops
            if page > 10:
                break
        
        # Filter by content/intent
        query_lower = query.lower()
        matching_gists = []
        
        for gist_data in all_gists:
            if (query_lower in gist_data.get('intent', '').lower() or 
                query_lower in gist_data.get('content', '').lower()):
                matching_gists.append(gist_data)
                
                if len(matching_gists) >= max_results:
                    break
        
        return matching_gists
    
    def sync_gist_metadata(self, gist: Gist) -> bool:
        """Sync local gist metadata with GitHub version."""
        try:
            github_gist = self.get_gist(gist.gist_id)
            if github_gist:
                # Update local metadata from GitHub
                gist.timestamp = github_gist.timestamp
                return True
            return False
        except Exception as e:
            print(f"Failed to sync gist {gist.gist_id}: {e}")
            return False
    
    def get_rate_limit_info(self) -> Dict[str, Any]:
        """Get current rate limit information."""
        try:
            response = self._make_request('GET', '/rate_limit')
            return response.get('rate', {})
        except Exception:
            return {}