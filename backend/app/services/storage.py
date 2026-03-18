"""
Image storage service — local filesystem for now, swappable to S3 later.
"""

import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile

UPLOAD_DIR = Path(__file__).parent.parent.parent / "data" / "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _ensure_dir(subdir: str) -> Path:
    path = UPLOAD_DIR / subdir
    path.mkdir(parents=True, exist_ok=True)
    return path


def _validate_file(file: UploadFile) -> None:
    if not file.filename:
        raise ValueError("No filename provided")
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"File type '{ext}' not allowed. Accepted: {', '.join(ALLOWED_EXTENSIONS)}"
        )


async def save_wardrobe_image(user_id: int, file: UploadFile) -> str:
    """Save a wardrobe item image. Returns the relative path from uploads root."""
    _validate_file(file)
    subdir = f"wardrobe/{user_id}"
    dir_path = _ensure_dir(subdir)

    ext = Path(file.filename).suffix.lower()
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = dir_path / filename

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise ValueError(f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)} MB")

    with open(file_path, "wb") as f:
        f.write(content)

    return f"{subdir}/{filename}"


async def save_profile_image(user_id: int, image_type: str, file: UploadFile) -> str:
    """Save a profile image (body or face). Returns relative path."""
    _validate_file(file)
    subdir = f"profiles/{user_id}"
    dir_path = _ensure_dir(subdir)

    ext = Path(file.filename).suffix.lower()
    filename = f"{image_type}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = dir_path / filename

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise ValueError(f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)} MB")

    with open(file_path, "wb") as f:
        f.write(content)

    return f"{subdir}/{filename}"


def delete_image(relative_path: str) -> bool:
    """Delete an image by relative path. Returns True if deleted."""
    file_path = UPLOAD_DIR / relative_path
    if file_path.exists():
        file_path.unlink()
        return True
    return False


def get_image_url(relative_path: str | None) -> str | None:
    """Convert a relative storage path to a URL path served by FastAPI."""
    if not relative_path:
        return None
    return f"/uploads/{relative_path}"
