from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from . import models
from .auth import router as auth_router
from .dependencies import get_current_user
from .models import User
from .schemas import ProfileUpdate, ChangePasswordRequest
from .security import hash_password, verify_password
from .upload import router as upload_router
from .chat import router as chat_router
from .documents import router as documents_router
from .notes import router as notes_router
from .stats import router as stats_router
from .flashcards import router as flashcards_router

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
app.include_router(documents_router)
app.include_router(notes_router)
app.include_router(stats_router)
app.include_router(flashcards_router)


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


@app.patch("/me")
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.name is not None:
        trimmed_name = payload.name.strip()
        if not trimmed_name:
            raise HTTPException(status_code=400, detail="Name cannot be empty")
        current_user.name = trimmed_name

    if payload.email is not None and payload.email != current_user.email:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = payload.email

    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
    }


@app.post("/me/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.password = hash_password(payload.new_password)
    db.commit()

    return {"message": "Password changed successfully"}