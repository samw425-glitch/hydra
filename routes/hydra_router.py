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
    """Advanced chat completion with multiple models"""
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
    """Generate images with DALL-E"""
    try:
        return await openai_service.generate_image(request)
    except Exception as e:
        logger.error(f"Image generation endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/multi-modal", response_model=HydraResponse)
async def multi_modal_request(request: MultiModalRequest):
    """Handle both chat and image generation in one request"""
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
    """List available OpenAI models"""
    try:
        return {
            "chat_models": ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
            "image_models": ["dall-e-3", "dall-e-2"]
        }
    except Exception as e:
        logger.error(f"Models endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
