from fastapi import APIRouter, UploadFile, File

from .parser import read_pdf, read_docx
from .ai.gemini import generate_notes

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    if file.filename.endswith(".pdf"):
        text = read_pdf(file.file)

    elif file.filename.endswith(".docx"):
        text = read_docx(file.file)

    else:
        return {
            "error": "Unsupported file"
        }

    notes = generate_notes(text)

    return {
    "filename": file.filename,
    "characters": len(text),
    "preview": text[:500],
    "document": text,
    "notes": notes,
}
    