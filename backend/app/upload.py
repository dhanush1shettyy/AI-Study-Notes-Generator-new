import os
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from .models import Document, User
from .schemas import DocumentResponse
from .dependencies import get_current_user

router = APIRouter()

UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB, adjust as you like


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    original_name = file.filename
    ext = os.path.splitext(original_name)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")

    user_folder = os.path.join(UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_folder, exist_ok=True)

    stored_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(user_folder, stored_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    file_type = ext.lstrip(".")

    document = Document(
        user_id=current_user.id,
        filename=original_name,
        file_path=file_path,
        file_type=file_type,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    return document