from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from deepface import DeepFace
import base64
import cv2
import numpy as np

app = FastAPI()

class ImageData(BaseModel):
    image: str
    user_id: str = None

class CompareData(BaseModel):
    image: str
    stored_embeddings: dict

def decode_image(base64_str):
    """Convert base64 string to OpenCV image"""
    img_bytes = base64.b64decode(base64_str.split(",")[1])
    img_array = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(img_array, cv2.IMREAD_COLOR)

@app.post("/extract-embedding")
def extract_embedding(data: ImageData):
    """Extract face embedding from image"""
    try:
        img = decode_image(data.image)
        
        # Extract embedding (converts face to 128 numbers)
        result = DeepFace.represent(
            img_path=img,
            model_name="Facenet",
            enforce_detection=True
        )
        
        embedding = result[0]["embedding"]
        
        return {
            "success": True,
            "embedding": embedding,
            "user_id": data.user_id
        }
        
    except ValueError as e:
        raise HTTPException(400, f"Invalid image format: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Face extraction failed: {str(e)}")

@app.post("/compare-embeddings")
def compare_embeddings(data: CompareData):
    """Compare new image with stored embeddings"""
    try:
        # Extract embedding from new image
        img = decode_image(data.image)
        new_embedding = DeepFace.represent(
            img_path=img,
            model_name="Facenet",
            enforce_detection=True
        )[0]["embedding"]
        
        # Get all stored embeddings from request
        stored_embeddings = data.stored_embeddings
        
        if not stored_embeddings:
            raise HTTPException(404, "No enrolled faces found")
        
        # Find best match using cosine distance
        from scipy.spatial.distance import cosine
        
        best_match_id = None
        best_confidence = 0
        
        for user_id, stored_embedding in stored_embeddings.items():
            distance = cosine(new_embedding, stored_embedding)
            confidence = round(1 - distance, 2)
            
            if confidence > best_confidence:
                best_confidence = confidence
                best_match_id = user_id
        
        # Confidence threshold (60%)
        if best_confidence < 0.60:
            raise HTTPException(404, "No match found - confidence too low")
        
        return {
            "user_id": best_match_id,
            "confidence": best_confidence
        }
        
    except ValueError as e:
        raise HTTPException(400, f"Invalid image format: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Face comparison failed: {str(e)}")

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "face-recognition",
        "model": "Facenet"
    }