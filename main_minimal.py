from fastapi import FastAPI
import openai
import os

app = FastAPI(title="Hydra AI Platform")

# Set OpenAI API key from environment
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.get("/")
async def root():
    return {"message": "🚀 Hydra AI Platform is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/v1/chat")
async def chat_completion(request: dict):
    try:
        response = openai.chat.completions.create(
            model=request.get("model", "gpt-3.5-turbo"),
            messages=request["messages"],
            temperature=request.get("temperature", 0.7)
        )
        return {
            "content": response.choices[0].message.content,
            "role": response.choices[0].message.role,
            "model": response.model
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8081)
