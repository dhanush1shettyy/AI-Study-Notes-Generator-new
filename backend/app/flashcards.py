import json
import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from .models import Document, Flashcard, User
from .schemas import FlashcardResponse
from .dependencies import get_current_user
from .file_utils import extract_text_from_file
from .ai.ai import generate_flashcards

router = APIRouter(prefix="/flashcards", tags=["Flashcards"])


def _parse_flashcards_json(raw_text: str):
    """
    The model is asked to return raw JSON, but sometimes wraps it in
    markdown code fences anyway. Strip those before parsing.
    """
    cleaned = raw_text.strip()
    cleaned = re.sub(r"^```json\s*", "", cleaned)
    cleaned = re.sub(r"^```\s*", "", cleaned)
    cleaned = re.sub(r"```\s*$", "", cleaned)
    cleaned = cleaned.strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="AI response could not be parsed into flashcards. Please try again.",
        )

    if not isinstance(data, list):
        raise HTTPException(
            status_code=500,
            detail="AI response was not in the expected flashcard format.",
        )

    cards = []
    for item in data:
        if isinstance(item, dict) and "question" in item and "answer" in item:
            cards.append({"question": str(item["question"]), "answer": str(item["answer"])})

    if not cards:
        raise HTTPException(
            status_code=500,
            detail="No valid flashcards were generated. Please try again.",
        )

    return cards


@router.post("/document/{document_id}/generate", response_model=list[FlashcardResponse])
def generate_flashcards_for_document(
    document_id: int,
    count: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id,
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if count < 1 or count > 30:
        raise HTTPException(status_code=400, detail="Count must be between 1 and 30")

    try:
        document_text = extract_text_from_file(document.file_path)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to read document content")

    raw_response = generate_flashcards(document_text, count=count)
    cards = _parse_flashcards_json(raw_response)

    # Replace any previously generated flashcards for this document
    db.query(Flashcard).filter(
        Flashcard.document_id == document_id,
        Flashcard.user_id == current_user.id,
    ).delete()

    new_cards = [
        Flashcard(
            user_id=current_user.id,
            document_id=document_id,
            question=card["question"],
            answer=card["answer"],
        )
        for card in cards
    ]
    db.add_all(new_cards)
    db.commit()

    for card in new_cards:
        db.refresh(card)

    return new_cards


@router.get("/document/{document_id}", response_model=list[FlashcardResponse])
def get_flashcards_for_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Flashcard)
        .filter(
            Flashcard.document_id == document_id,
            Flashcard.user_id == current_user.id,
        )
        .order_by(Flashcard.id.asc())
        .all()
    )