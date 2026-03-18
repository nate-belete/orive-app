import secrets
from collections import defaultdict
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Request
from sqlmodel import Session, select
from ..db import get_session
from .. import models
from .security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from .schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserRead,
    UserUpdate,
    OnboardingCompleteRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
)
from ..services.storage import save_profile_image, get_image_url

router = APIRouter()

# --- Rate limiting (in-memory, suitable for POC) ---
_login_attempts: dict[str, list[datetime]] = defaultdict(list)
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_WINDOW_MINUTES = 15

_reset_attempts: dict[str, list[datetime]] = defaultdict(list)
MAX_RESET_REQUESTS = 3
RESET_WINDOW_MINUTES = 60


def _check_rate_limit(email: str) -> None:
    """Raise 429 if too many failed login attempts for this email."""
    now = datetime.utcnow()
    cutoff = now - timedelta(minutes=LOCKOUT_WINDOW_MINUTES)
    # Prune old entries
    _login_attempts[email] = [t for t in _login_attempts[email] if t > cutoff]
    if len(_login_attempts[email]) >= MAX_LOGIN_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Please try again in {LOCKOUT_WINDOW_MINUTES} minutes.",
        )


def _record_failed_attempt(email: str) -> None:
    _login_attempts[email].append(datetime.utcnow())


def _clear_attempts(email: str) -> None:
    _login_attempts.pop(email, None)


def _user_to_read(user: models.User) -> UserRead:
    return UserRead(
        id=user.id,
        email=user.email,
        full_name=user.full_name or f"{user.first_name} {user.last_name}".strip(),
        first_name=user.first_name or "",
        last_name=user.last_name or "",
        is_active=user.is_active,
        onboarding_complete=user.onboarding_complete,
        gender=user.gender,
        date_of_birth=user.date_of_birth,
        postcode=user.postcode,
        height_cm=user.height_cm,
        weight_kg=user.weight_kg,
        body_type=user.body_type,
        body_photo_path=user.body_photo_path,
        face_photo_path=user.face_photo_path,
        style_go_tos=user.style_go_tos,
        style_no_goes=user.style_no_goes,
        style_cant_wear=user.style_cant_wear,
        colour_season=user.colour_season,
        created_at=user.created_at,
    )


@router.post("/register", response_model=TokenResponse)
def register(request: RegisterRequest, session: Session = Depends(get_session)):
    existing = session.exec(
        select(models.User).where(models.User.email == request.email.lower())
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    first = request.first_name.strip()
    last = request.last_name.strip()
    full = request.full_name.strip() or f"{first} {last}".strip()
    user = models.User(
        email=request.email.lower().strip(),
        hashed_password=hash_password(request.password),
        full_name=full,
        first_name=first,
        last_name=last,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=_user_to_read(user))


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, session: Session = Depends(get_session)):
    email = request.email.lower()

    # Check rate limit before processing
    _check_rate_limit(email)

    user = session.exec(
        select(models.User).where(models.User.email == email)
    ).first()

    if not user or not verify_password(request.password, user.hashed_password):
        _record_failed_attempt(email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    # Successful login — clear failed attempts
    _clear_attempts(email)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=_user_to_read(user))


@router.get("/me", response_model=UserRead)
def get_me(current_user: models.User = Depends(get_current_user)):
    return _user_to_read(current_user)


@router.patch("/me", response_model=UserRead)
def update_profile(
    updates: UserUpdate,
    current_user: models.User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    current_user.updated_at = datetime.utcnow()
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return _user_to_read(current_user)


@router.post("/me/upload-body-photo", response_model=UserRead)
async def upload_body_photo(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        path = await save_profile_image(current_user.id, "body", file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    current_user.body_photo_path = path
    current_user.updated_at = datetime.utcnow()
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return _user_to_read(current_user)


@router.post("/me/upload-face-photo", response_model=UserRead)
async def upload_face_photo(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        path = await save_profile_image(current_user.id, "face", file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    current_user.face_photo_path = path
    current_user.updated_at = datetime.utcnow()
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return _user_to_read(current_user)


@router.post("/me/complete-onboarding", response_model=UserRead)
def complete_onboarding(
    current_user: models.User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    current_user.onboarding_complete = True
    current_user.updated_at = datetime.utcnow()
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return _user_to_read(current_user)


def _check_reset_rate_limit(email: str) -> None:
    """Raise 429 if too many reset requests for this email (FR-UM-06: 3/hr)."""
    now = datetime.utcnow()
    cutoff = now - timedelta(minutes=RESET_WINDOW_MINUTES)
    _reset_attempts[email] = [t for t in _reset_attempts[email] if t > cutoff]
    if len(_reset_attempts[email]) >= MAX_RESET_REQUESTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many reset requests. Please try again in {RESET_WINDOW_MINUTES} minutes.",
        )


@router.post("/password-reset/request")
def request_password_reset(
    request: PasswordResetRequest,
    session: Session = Depends(get_session),
):
    email = request.email.lower()
    _check_reset_rate_limit(email)
    _reset_attempts[email].append(datetime.utcnow())

    user = session.exec(
        select(models.User).where(models.User.email == email)
    ).first()

    # Always return success to avoid email enumeration
    if not user:
        return {"message": "If an account with that email exists, a reset link has been sent."}

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
    session.add(user)
    session.commit()

    # For local dev: print the reset link to terminal
    reset_url = f"http://localhost:5173/reset-password?token={token}"
    print(f"\n{'='*60}")
    print(f"PASSWORD RESET LINK (local dev)")
    print(f"User: {user.email}")
    print(f"URL: {reset_url}")
    print(f"Expires: {user.reset_token_expires}")
    print(f"{'='*60}\n")

    return {"message": "If an account with that email exists, a reset link has been sent."}


@router.post("/password-reset/confirm")
def confirm_password_reset(
    request: PasswordResetConfirm,
    session: Session = Depends(get_session),
):
    user = session.exec(
        select(models.User).where(models.User.reset_token == request.token)
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if user.reset_token_expires and user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token has expired")

    # FR-UM-07: Cannot reuse current password
    if verify_password(request.new_password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from your current password",
        )

    user.hashed_password = hash_password(request.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    user.updated_at = datetime.utcnow()
    session.add(user)
    session.commit()

    # FR-UM-07: Auto-login after successful reset
    token = create_access_token(user.id)
    return {
        "message": "Password has been reset successfully",
        "access_token": token,
        "token_type": "bearer",
    }
