from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .database import get_db
from .models import Document, Note, ChatMessage, User
from .dependencies import get_current_user

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/")
def get_user_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_documents = db.query(func.count(Document.id)).filter(Document.user_id == current_user.id).scalar()
    total_notes = db.query(func.count(Note.id)).filter(Note.user_id == current_user.id).scalar()
    total_messages = db.query(func.count(ChatMessage.id)).filter(ChatMessage.user_id == current_user.id).scalar()

    return {
        "total_documents": total_documents,
        "total_notes": total_notes,
        "total_chat_messages": total_messages,
    }