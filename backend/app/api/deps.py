from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
# from jose import jwt, JWTError # Removed python-jose
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials", 
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # try:
    #     # Debugging: Print Header
    #     unverified_header = jwt.get_unverified_header(token)
    #     print(f"DEBUG: Token Header alg: {unverified_header.get('alg')}")
    #     print(f"DEBUG: Token type: {unverified_header.get('typ')}")
    #     
    #     # Decode
    #     payload = jwt.decode(
    #         token, 
    #         settings.SUPABASE_JWT_SECRET, 
    #         algorithms=["HS256"],
    #         audience="authenticated", 
    #         options={"verify_aud": False}
    #     )
    #     email: str = payload.get("email")
    #     if email is None:
    #         raise credentials_exception
            
    # except jwt.PyJWTError as e:
    #     print(f"JWT Validation Error: {e}") 
    #     print(f"DEBUG: Secret length: {len(settings.SUPABASE_JWT_SECRET)}")
    #     raise credentials_exception

    # SWITCH TO SUPABASE CLIENT VALIDATION (Handles ES256/HS256 automatically via API)
    from supabase import create_client, Client
    try:
        supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        user_response = supabase.auth.get_user(token)
        
        # Check if user object exists (structure depends on version, usually .user)
        if hasattr(user_response, 'user') and user_response.user:
            user_data = user_response.user
        else:
            # Fallback for some versions or direct dict
            user_data = user_response
            
        email = user_data.email
        if not email:
            raise Exception("No email in user data")
            
        user_metadata = user_data.user_metadata or {}
        full_name = user_metadata.get("full_name", "")
            
    except Exception as e:
        print(f"Supabase Auth API Validation Error: {e}")
        raise credentials_exception

    # Check if user exists in our local DB (sync/cache)
    user = db.query(User).filter(User.email == email).first()
    
    # If using Supabase, we might not have the user locally yet if they signed up via another app/frontend directly
    # So we create a local record for them (Sync)
    if user is None:
        user = User(email=email, full_name=full_name)
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return user
