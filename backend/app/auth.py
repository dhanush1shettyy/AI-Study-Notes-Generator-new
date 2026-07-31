from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from .models import User
from .schemas import UserCreate, UserLogin, UserResponse
from .security import hash_password
from .security import verify_password
from .jwt_handler import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(user.password, existing_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(
        {"sub": existing_user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

import random
import string
from datetime import datetime, timedelta

from .models import PasswordResetCode
from .schemas import ForgotPasswordRequest, ResetPasswordRequest
from .email_service import send_reset_code_email


def generate_reset_code() -> str:
    return "".join(random.choices(string.digits, k=6))


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    # Always return a generic success message, even if the email doesn't exist —
    # this avoids leaking which emails are registered.
    if not user:
        return {"message": "If that email is registered, a reset code has been sent."}

    code = generate_reset_code()
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    reset_entry = PasswordResetCode(
        user_id=user.id,
        code=code,
        expires_at=expires_at,
    )
    db.add(reset_entry)
    db.commit()

    try:
        send_reset_code_email(user.email, code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    return {"message": "If that email is registered, a reset code has been sent."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or code")

    reset_entry = (
        db.query(PasswordResetCode)
        .filter(
            PasswordResetCode.user_id == user.id,
            PasswordResetCode.code == payload.code,
            PasswordResetCode.used == False,
        )
        .order_by(PasswordResetCode.created_at.desc())
        .first()
    )

    if not reset_entry:
        raise HTTPException(status_code=400, detail="Invalid or already-used code")

    if reset_entry.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Code has expired")

    user.password = hash_password(payload.new_password)
    reset_entry.used = True
    db.commit()

    return {"message": "Password reset successfully"}

@router.post("/verify-reset-code")
def verify_reset_code(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email")
    code = payload.get("code")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or code")

    reset_entry = (
        db.query(PasswordResetCode)
        .filter(
            PasswordResetCode.user_id == user.id,
            PasswordResetCode.code == code,
            PasswordResetCode.used == False,
        )
        .order_by(PasswordResetCode.created_at.desc())
        .first()
    )

    if not reset_entry:
        raise HTTPException(status_code=400, detail="Invalid or already-used code")

    if reset_entry.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Code has expired")

    return {"message": "Code verified"}