#!/bin/bash
set -e
echo "🚀 Starting Hydra Project Reorganization..."
cd ~/dev/hydra
mkdir -p {app,core,api,routes,models,services,utils,static,templates,config,scripts,tests,deploy,logs}
touch app/__init__.py core/__init__.py api/__init__.py routes/__init__.py models/__init__.py services/__init__.py utils/__init__.py config/__init__.py tests/__init__.py

# Create config/settings.py
mkdir -p config
cat > config/settings.py << 'SETTINGS_EOF'
import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "Hydra AI Platform"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8080
    openai_api_key: str
    openai_org_id: Optional[str] = None
    default_image_size: str = "1024x1024"
    default_image_model: str = "dall-e-3"
    
    class Config:
        env_file = ".env"

def get_settings():
    return Settings()
SETTINGS_EOF

# Create app/__init__.py
cat > app/__init__.py << 'APP_EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config.settings import get_settings

def create_app():
    app = FastAPI(
        title="Hydra AI Platform",
        description="Multi-modal AI API with OpenAI integration",
        version="1.0.0"
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.mount("/static", StaticFiles(directory="static"), name="static")
    return app
APP_EOF

# Create models/schemas.py
mkdir -p models
cat > models/schemas.py << 'SCHEMAS_EOF'
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class Role(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"

class Message(BaseModel):
    role: Role
    content: str

class ImageSize(str, Enum):
    SMALL = "256x256"
    MEDIUM = "512x512"
    LARGE = "1024x1024"
    HD = "1024x1792"
    VERTICAL = "1792x1024"

class ImageFormat(str, Enum):
    URL = "url"
    B64_JSON = "b64_json"

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str = Field(default="gpt-4", description="Model to use for completion")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = None
    stream: bool = False

class ImageRequest(BaseModel):
    prompt: str
    model: str = Field(default="dall-e-3", description="Image model to use")
    size: ImageSize = Field(default=ImageSize.LARGE)
    quality: str = Field(default="standard")
    style: Optional[str] = Field(default=None)
    n: int = Field(default=1, ge=1, le=10)

class MultiModalRequest(BaseModel):
    chat_request: ChatRequest
    image_request: Optional[ImageRequest] = None
    generate_image: bool = False

class ChatResponse(BaseModel):
    content: str
    role: str
    model: str
    usage: Optional[Dict[str, int]] = None
    finish_reason: Optional[str] = None
    processing_time: float = 0.0

class ImageResponse(BaseModel):
    url: Optional[str] = None
    b64_json: Optional[str] = None
    revised_prompt: Optional[str] = None
    processing_time: float = 0.0

class HydraResponse(BaseModel):
    chat_response: Optional[ChatResponse] = None
    image_response: Optional[ImageResponse] = None
    error: Optional[str] = None
    processing_time: float
SCHEMAS_EOF

# Create services/openai_service.py
mkdir -p services
cat > services/openai_service.py << 'SERVICE_EOF'
import openai
import time
from typing import List, Optional, Dict, Any
from models.schemas import Message, ChatRequest, ImageRequest, ChatResponse, ImageResponse
from config.settings import get_settings
from utils.logger import get_logger

logger = get_logger(__name__)

class OpenAIService:
    def __init__(self):
        self.settings = get_settings()
        self.client = openai.OpenAI(api_key=self.settings.openai_api_key)
    
    async def chat_completion(self, request: ChatRequest) -> ChatResponse:
        try:
            start_time = time.time()
            
            response = self.client.chat.completions.create(
                model=request.model,
                messages=[{"role": msg.role.value, "content": msg.content} for msg in request.messages],
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                stream=request.stream
            )
            
            processing_time = time.time() - start_time
            
            return ChatResponse(
                content=response.choices[0].message.content,
                role=response.choices[0].message.role,
                model=response.model,
                usage=response.usage.dict() if response.usage else None,
                finish_reason=response.choices[0].finish_reason,
                processing_time=processing_time
            )
            
        except Exception as e:
            logger.error(f"Chat completion error: {str(e)}")
            raise
    
    async def generate_image(self, request: ImageRequest) -> ImageResponse:
        try:
            start_time = time.time()
            
            response = self.client.images.generate(
                model=request.model,
                prompt=request.prompt,
                size=request.size.value,
                quality=request.quality,
                style=request.style,
                n=request.n,
                response_format="url"
            )
            
            processing_time = time.time() - start_time
            
            return ImageResponse(
                url=response.data[0].url,
                revised_prompt=response.data[0].revised_prompt,
                processing_time=processing_time
            )
            
        except Exception as e:
            logger.error(f"Image generation error: {str(e)}")
            raise

openai_service = OpenAIService()
SERVICE_EOF

# Create utils/logger.py
mkdir -p utils
cat > utils/logger.py << 'LOGGER_EOF'
import logging
import sys
from pathlib import Path

def get_logger(name: str):
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        log_path = Path("logs/hydra.log")
        log_path.parent.mkdir(exist_ok=True)
        
        file_handler = logging.FileHandler(log_path)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger
LOGGER_EOF

# Create routes/hydra_router.py
mkdir -p routes
cat > routes/hydra_router.py << 'ROUTER_EOF'
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import time

from models.schemas import (
    ChatRequest, ImageRequest, MultiModalRequest, 
    ChatResponse, ImageResponse, HydraResponse
)
from services.openai_service import openai_service
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/v1", tags=["hydra"])

@router.post("/chat", response_model=ChatResponse)
async def chat_completion(request: ChatRequest):
    try:
        start_time = time.time()
        response = await openai_service.chat_completion(request)
        response.processing_time = time.time() - start_time
        return response
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-image", response_model=ImageResponse)
async def generate_image(request: ImageRequest):
    try:
        return await openai_service.generate_image(request)
    except Exception as e:
        logger.error(f"Image generation endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/multi-modal", response_model=HydraResponse)
async def multi_modal_request(request: MultiModalRequest):
    try:
        start_time = time.time()
        
        chat_response = None
        image_response = None
        error = None
        
        if request.chat_request:
            chat_response = await openai_service.chat_completion(request.chat_request)
        
        if request.generate_image and request.image_request:
            image_response = await openai_service.generate_image(request.image_request)
        
        processing_time = time.time() - start_time
        
        return HydraResponse(
            chat_response=chat_response,
            image_response=image_response,
            error=error,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Multi-modal endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
async def list_available_models():
    try:
        return {
            "chat_models": ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
            "image_models": ["dall-e-3", "dall-e-2"]
        }
    except Exception as e:
        logger.error(f"Models endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
ROUTER_EOF

# Create main.py
cat > main.py << 'MAIN_EOF'
from app import create_app
from routes.hydra_router import router as hydra_router
from config.settings import get_settings

app = create_app()
app.include_router(hydra_router)

@app.get("/")
async def root():
    return {
        "message": "🚀 Hydra AI Platform is running!",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/api/v1/chat",
            "image_generation": "/api/v1/generate-image",
            "multi_modal": "/api/v1/multi-modal",
            "models": "/api/v1/models"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Hydra AI Platform"}

if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )
MAIN_EOF

# Create requirements.txt
cat > requirements.txt << 'REQUIREMENTS_EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
openai==1.3.0
python-dotenv==1.0.0
pydantic[email]==2.5.0
pydantic-settings==2.1.0
python-multipart==0.0.6
aiofiles==23.2.1
jinja2==3.1.2
REQUIREMENTS_EOF

# Create .env file
cat > .env << 'ENV_EOF'
DEBUG=true
HOST=0.0.0.0
PORT=8080
OPENAI_API_KEY=your_actual_openai_api_key_here
OPENAI_ORG_ID=your_org_id_optional
DEFAULT_IMAGE_SIZE=1024x1024
DEFAULT_IMAGE_MODEL=dall-e-3
ENV_EOF

# Create scripts directory and deploy script
mkdir -p scripts
cat > scripts/deploy.sh << 'DEPLOY_EOF'
#!/bin/bash
echo "🚀 Deploying Hydra API..."
cd ~/dev/hydra
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
DEPLOY_EOF

chmod +x scripts/deploy.sh
chmod +x reorganize_hydra.sh

echo "✅ Project reorganization completed!"
echo "📋 Next steps:"
echo "1. Update your .env file: nano .env"
echo "2. Install dependencies: pip install -r requirements.txt"
echo "3. Run the API: ./scripts/deploy.sh"
