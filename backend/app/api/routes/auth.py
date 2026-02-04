from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, Token, ForgotPasswordRequest, ResetPasswordRequest
from app.core.security import get_password_hash, verify_password, create_access_token
import datetime
import secrets

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pass = get_password_hash(user_in.password)
    new_user = User(email=user_in.email, hashed_password=hashed_pass)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

from app.services.email_service import send_email

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User does not exist")
    
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    db.commit()
    
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    
    # 1. Print to console (Fallback/Dev)
    print(f"RESET LINK FOR {user.email}: {reset_link}")
    
    # 2. Send Real Email
    subject = "Reset your SkillSync password"
    body_text = f"Hello,\n\nYou requested a password reset. Please use the following link to reset your password:\n\n{reset_link}\n\nThis link expires in 15 minutes.\n\nIf you did not request this, please ignore this email."
    
    body_html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your SkillSync account.</p>
        <p>Please click the button below to reset your password:</p>
        <p>
          <a href="{reset_link}" style="background-color: #2ea44f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="{reset_link}">{reset_link}</a></p>
        <p>This link expires in 15 minutes.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">If you did not request this, please ignore this email.</p>
      </body>
    </html>
    """
    
    # Send asynchronously or synchronously (function is sync but logging prevents crash)
    send_email(user.email, subject, body_html, body_text)
    
    return {"message": "If the email is registered, a reset link has been sent."}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == request.token).first()
    
    if not user or not user.reset_token_expiry or user.reset_token_expiry < datetime.datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user.hashed_password = get_password_hash(request.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()
    
    return {"message": "Password reset successfully"}


