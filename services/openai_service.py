import openai
import time
import os
from typing import List, Optional, Dict, Any
from models.schemas import Message, ChatRequest, ImageRequest, ChatResponse, ImageResponse
from config.settings import get_settings
from utils.logger import get_logger

logger = get_logger(__name__)

class OpenAIService:
    def __init__(self):
        self.settings = get_settings()
        # Set the API key directly in the environment for compatibility
        os.environ["OPENAI_API_KEY"] = self.settings.openai_api_key
        self.client = openai.OpenAI()
    
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
