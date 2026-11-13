import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserRegister, UserLogin, Token, UserResponse, UserSettingsUpdate
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered."
        )

    user_id = f"user-{uuid.uuid4().hex[:12]}"
    user = User(
        id=user_id,
        email=user_in.email,
        full_name=user_in.full_name or "Student",
        hashed_password=hash_password(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email})
    return Token(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name
    )

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": user.id, "email": user.email})
    return Token(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/settings", response_model=UserResponse)
def update_settings(
    settings_in: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if settings_in.preferred_study_time is not None:
        current_user.preferred_study_time = settings_in.preferred_study_time
    if settings_in.daily_hour_target is not None:
        current_user.daily_hour_target = settings_in.daily_hour_target
    if settings_in.full_name is not None:
        current_user.full_name = settings_in.full_name

    db.commit()
    db.refresh(current_user)
    return current_user

