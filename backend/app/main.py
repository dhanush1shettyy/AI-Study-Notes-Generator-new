from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from . import models
from .auth import router as auth_router
from .dependencies import get_current_user
from .models import User
from fastapi import Depends
from .upload import router as upload_router
from .chat import router as chat_router
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Study Notes Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(chat_router)

@app.get("/")
def read_root():
    return {"message": "AI Study Notes Generator API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/me")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
    }
