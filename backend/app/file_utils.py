import os
import pdfplumber
from docx import Document as DocxDocument


def extract_text_from_file(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return _extract_from_pdf(file_path)
    elif ext == ".docx":
        return _extract_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def _extract_from_pdf(file_path: str) -> str:
    text_parts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

    return "\n".join(text_parts)


def _extract_from_docx(file_path: str) -> str:
    doc = DocxDocument(file_path)
    text_parts = [para.text for para in doc.paragraphs if para.text.strip()]
    return "\n".join(text_parts)