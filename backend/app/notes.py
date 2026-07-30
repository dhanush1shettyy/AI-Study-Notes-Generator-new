from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from .models import Note, Document, User
from .schemas import NoteCreate, NoteResponse
from .dependencies import get_current_user

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.post("/", response_model=NoteResponse)
def create_note(note: NoteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Make sure the document belongs to this user before attaching a note to it
    document = db.query(Document).filter(
        Document.id == note.document_id,
        Document.user_id == current_user.id,
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    new_note = Note(
        user_id=current_user.id,
        document_id=note.document_id,
        title=note.title,
        content=note.content,
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


@router.get("/", response_model=list[NoteResponse])
def list_notes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Note)
        .filter(Note.user_id == current_user.id)
        .order_by(Note.created_at.desc())
        .all()
    )


@router.get("/document/{document_id}", response_model=list[NoteResponse])
def get_notes_for_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Note)
        .filter(Note.document_id == document_id, Note.user_id == current_user.id)
        .order_by(Note.created_at.desc())
        .all()
    )


@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()

    return {"detail": "Note deleted"}