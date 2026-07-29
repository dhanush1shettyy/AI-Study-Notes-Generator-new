from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from .models import ChatMessage, Document, User
from .schemas import ChatMessageCreate, ChatMessageResponse
from .dependencies import get_current_user
from .ai import ask_pdf  # renamed from chat.py

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/", response_model=ChatMessageResponse)
def create_chat_message(msg: ChatMessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document = db.query(Document).filter(
        Document.id == msg.document_id,
        Document.user_id == current_user.id,
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Save the user's question first
    user_msg = ChatMessage(
        user_id=current_user.id,
        document_id=msg.document_id,
        role="user",
        content=msg.content,
    )
    db.add(user_msg)
    db.commit()

    # TODO: replace this with however you're currently extracting text from the PDF
    document_text = extract_text_from_file(document.file_path)

    answer = ask_pdf(document=document_text, question=msg.content)

    # Save the assistant's reply
    assistant_msg = ChatMessage(
        user_id=current_user.id,
        document_id=msg.document_id,
        role="assistant",
        content=answer,
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg


@router.get("/document/{document_id}", response_model=list[ChatMessageResponse])
def get_chat_history(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.document_id == document_id, ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )