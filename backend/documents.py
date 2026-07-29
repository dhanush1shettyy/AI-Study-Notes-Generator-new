import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from .models import Document, Note, User
from .schemas import DocumentResponse, NoteResponse
from .dependencies import get_current_user
from .file_utils import extract_text_from_file
from .ai.ai import generate_notes

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.get("/", response_model=list[DocumentResponse])
def list_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id,
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return document


@router.post("/{document_id}/generate-notes", response_model=NoteResponse)
def generate_notes_for_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id,
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        document_text = extract_text_from_file(document.file_path)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to read document content")

    notes_content = generate_notes(document_text)

    note = Note(
        user_id=current_user.id,
        document_id=document.id,
        title=document.filename,
        content=notes_content,
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    return note


@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id,
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    db.delete(document)
    db.commit()

    return {"detail": "Document deleted"}