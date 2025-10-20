import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # API Settings
    app_name: str = "Hydra AI Platform"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8081
    
    # OpenAI - will be loaded from environment
    openai_api_key: str = ""
    openai_org_id: Optional[str] = None
    
    # Image Generation
    default_image_size: str = "1024x1024"
    default_image_model: str = "dall-e-3"
    
    class Config:
        env_file = ".env"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Set the API key in environment when settings are loaded
        if self.openai_api_key:
            os.environ["OPENAI_API_KEY"] = self.openai_api_key

def get_settings():
    return Settings()
