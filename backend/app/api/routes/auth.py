from fastapi import APIRouter, Depends, HTTPException, status, Response, Body
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.auth import UserCreate, UserLogin, Token, ForgotPasswordRequest, ResetPasswordRequest
from app.core.config import settings
import requests

router = APIRouter()

# Supabase Auth Endpoints
SUPABASE_AUTH_URL = f"{settings.SUPABASE_URL}/auth/v1"
HEADERS = {"apikey": settings.SUPABASE_KEY, "Content-Type": "application/json"}

@router.post("/register", response_model=Token)
def register(response: Response, user_in: UserCreate):
    url = f"{SUPABASE_AUTH_URL}/signup"
    payload = {
        "email": user_in.email,
        "password": user_in.password,
        "data": {"full_name": user_in.email.split("@")[0]} # Default metadata
    }
    
    api_resp = requests.post(url, json=payload, headers=HEADERS)
    
    if api_resp.status_code != 200:
        raise HTTPException(status_code=400, detail=api_resp.json().get("msg", "Registration failed"))
        
    data = api_resp.json()
    access_token = data.get("access_token")
    
    if access_token:
        expires_in = data.get("expires_in", 3600)
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=expires_in,
            samesite="lax",
            secure=False
        )
        refresh_token = data.get("refresh_token")
        if refresh_token:
            response.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                samesite="lax",
                secure=False
            )
            
    if not access_token:
        # Check if auto-confirm is off
        if "id" in data:
             return {"access_token": "check_email_confirmation", "token_type": "bearer"} # Placeholder for UI
        raise HTTPException(status_code=400, detail="Registration processed but no session returned")
        
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(response: Response, user_in: UserLogin):
    url = f"{SUPABASE_AUTH_URL}/token?grant_type=password"
    payload = {"email": user_in.email, "password": user_in.password}
    
    api_resp = requests.post(url, json=payload, headers=HEADERS)
    
    if api_resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    data = api_resp.json()
    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")
    
    # SET HTTP-ONLY COOKIE
    # Expires in however many seconds Supabase says (usually 3600)
    expires_in = data.get("expires_in", 3600)
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=expires_in,
        samesite="lax",
        secure=False 
        # Set secure=True in production!
    )
    
    # Optional: Set refresh token too if we want to implement refresh
    if refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            samesite="lax",
            secure=False
        )

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest):
    url = f"{SUPABASE_AUTH_URL}/recover"
    payload = {"email": request.email}
    
    # This sends the email from Supabase
    api_resp = requests.post(url, json=payload, headers=HEADERS)
    
    if api_resp.status_code != 200:
        # Don't reveal if user exists or not for security, but for now:
        # raise HTTPException(status_code=400, detail="Failed to send reset email")
        pass
        
    return {"message": "If the email is registered, a reset link has been sent."}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    # User provides the access_token (from email link) and new_password
    # Since we are using cookies, the "access_token" might be in the request body if the frontend extracted it from the URL fragment
    # Or, the user might need to pass it explicitly.
    # The ResetPasswordRequest model typically has 'token' + 'new_password'.
    
    url = f"{SUPABASE_AUTH_URL}/user"
    # We must authorize as the user to update their password
    user_headers = HEADERS.copy()
    user_headers["Authorization"] = f"Bearer {request.token}"
    
    payload = {"password": request.new_password}
    
    api_resp = requests.put(url, json=payload, headers=user_headers)
    
    if api_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid token or password update failed")
        
    return {"message": "Password reset successfully"}


