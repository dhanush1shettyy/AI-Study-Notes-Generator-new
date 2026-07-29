from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


class DocumentCreate(BaseModel):
    filename: str
    file_type: str


class DocumentResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    file_path: str
    file_type: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


class NoteCreate(BaseModel):
    document_id: int
    title: Optional[str] = None
    content: str


class NoteResponse(BaseModel):
    id: int
    user_id: int
    document_id: int
    title: Optional[str]
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessageCreate(BaseModel):
    document_id: int
    role: str
    content: str


class ChatMessageResponse(BaseModel):
    id: int
    user_id: int
    document_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True