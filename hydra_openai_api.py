from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import openai
import base64
import os

# OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="Hydra OpenAI API", version="2.0")

# Request body models
class Message(BaseModel):
    role: str
    content: str

class RequestBody(BaseModel):
    messages: Optional[List[Message]] = None   # for chat
    prompt: Optional[str] = None               # for image
    model: str = "gpt-4"                       # default chat model
    generate_image: Optional[bool] = False
    image_size: Optional[str] = "1024x1024"    # 256x256, 512x512, 1024x1024
    image_format: Optional[str] = "png"        # png or jpeg

@app.post("/hydra")
async def hydra_endpoint(body: RequestBody):
    try:
        # IMAGE GENERATION
        if body.generate_image:
            if not body.prompt:
                raise HTTPException(status_code=400, detail="Field 'prompt' is required for image generation.")

            response = openai.images.generate(
                model="gpt-image-1-mini",
                prompt=body.prompt,
                size=body.image_size
            )
            image_base64 = response.data[0].b64_json
            image_bytes = base64.b64decode(image_base64)
            filename = f"generated_image.{body.image_format}"
            with open(filename, "wb") as f:
                f.write(image_bytes)

            return {
                "message": "Image generated successfully",
                "file": filename
            }

        # CHAT COMPLETION
        else:
            if not body.messages:
                raise HTTPException(status_code=400, detail="Field 'messages' is required for chat completion.")

            messages_payload = [{"role": m.role, "content": m.content} for m in body.messages]

            response = openai.chat.completions.create(
                model=body.model,
                messages=messages_payload
            )

            return {"response": response.choices[0].message}

    # HANDLE OPENAI ERRORS
    except openai.error.AuthenticationError:
        raise HTTPException(status_code=401, detail="Invalid OpenAI API Key")
    except openai.error.PermissionDeniedError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
