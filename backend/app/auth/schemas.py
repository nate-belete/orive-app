import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


def _validate_password_strength(password: str) -> str:
    """Enforce FRS FR-UM-03: min 8 chars, uppercase, lowercase, number."""
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"[0-9]", password):
        raise ValueError("Password must contain at least one number")
    return password


class RegisterRequest(BaseModel):
    email: str = Field(description="User email address")
    password: str = Field(min_length=8, max_length=128, description="Password (8-128 chars)")
    full_name: str = Field(default="", max_length=100, description="Full name (legacy, optional)")
    first_name: str = Field(default="", min_length=1, max_length=50, description="First name")
    last_name: str = Field(default="", min_length=1, max_length=50, description="Last name")

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        return _validate_password_strength(v)


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserRead"


class UserRead(BaseModel):
    id: int
    email: str
    full_name: str
    first_name: str = ""
    last_name: str = ""
    is_active: bool
    onboarding_complete: bool
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    postcode: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    body_type: Optional[str] = None
    body_photo_path: Optional[str] = None
    face_photo_path: Optional[str] = None
    style_go_tos: Optional[str] = None
    style_no_goes: Optional[str] = None
    style_cant_wear: Optional[str] = None
    colour_season: Optional[str] = None
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    postcode: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    body_type: Optional[str] = None
    style_go_tos: Optional[str] = None
    style_no_goes: Optional[str] = None
    style_cant_wear: Optional[str] = None


class OnboardingCompleteRequest(BaseModel):
    """Mark onboarding as complete."""
    pass


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        return _validate_password_strength(v)


# Resolve forward reference
TokenResponse.model_rebuild()
