from fastapi import APIRouter
from pydantic import BaseModel

from .ai.chat import ask_pdf

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

class ChatRequest(BaseModel):
    document: str
    question: str


@router.post("/")
async def chat(request: ChatRequest):

    answer = ask_pdf(
        request.document,
        request.question
    )

    return {
        "answer": answer
    }