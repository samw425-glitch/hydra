from app import create_app
from routes.hydra_router import router as hydra_router
from config.settings import get_settings

# Create FastAPI app
app = create_app()

# Include routers
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
