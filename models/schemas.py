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
