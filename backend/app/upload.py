from fastapi import APIRouter, UploadFile, File

from .parser import read_pdf, read_docx

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

    return {
        "filename": file.filename,
        "characters": len(text),
        "preview": text[:500],
    }