import openai
import base64
import os
from PIL import Image
from io import BytesIO
from datetime import datetime

# Make sure your API key is exported in the shell
# export OPENAI_API_KEY="sk-..."

prompt = input("Enter image prompt: ")

try:
    response = openai.Image.create(
        model="gpt-image-1",
        prompt=prompt,
        size="1024x1024"
    )

    # Decode the image
    image_base64 = response['data'][0]['b64_json']
    image_bytes = base64.b64decode(image_base64)

    # Create a unique filename using timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"gpt_image_{timestamp}.png"

    with open(filename, "wb") as f:
        f.write(image_bytes)

    print(f"Image generated and saved as {filename}")

    # Open the image automatically
    img = Image.open(filename)
    img.show()

except openai.error.PermissionDeniedError as e:
    print(f"Permission denied: {e}")
except Exception as e:
    print(f"Error generating image: {e}")
