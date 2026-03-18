import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session
from ..db import get_session
from .. import models
from ..auth.security import get_current_user
from ..services.storage import save_profile_image, get_image_url
from ..services.colour_analysis import analyse_face_photo

router = APIRouter()


@router.post("/analyse")
async def run_colour_analysis(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    """Upload a face photo and run AI colour analysis."""
    # Save face photo
    try:
        path = await save_profile_image(current_user.id, "face", file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Run analysis
    result = analyse_face_photo(path)

    # Save to user profile
    current_user.face_photo_path = path
    current_user.colour_season = result.get("season", "Unknown")
    current_user.colour_palette_json = json.dumps(result)
    current_user.updated_at = datetime.utcnow()
    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return {
        "season": current_user.colour_season,
        "face_photo_url": get_image_url(current_user.face_photo_path),
        "palette": result,
    }


@router.get("/results")
def get_colour_results(
    current_user: models.User = Depends(get_current_user),
):
    """Get the user's colour analysis results."""
    if not current_user.colour_season or not current_user.colour_palette_json:
        raise HTTPException(status_code=404, detail="No colour analysis results found. Upload a face photo first.")

    palette = json.loads(current_user.colour_palette_json)
    return {
        "season": current_user.colour_season,
        "face_photo_url": get_image_url(current_user.face_photo_path),
        "palette": palette,
    }


@router.post("/reanalyse")
async def reanalyse_colour(
    file: UploadFile = File(None),
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    """Re-run colour analysis. Optionally with a new photo, or reuse existing."""
    if file and file.filename:
        try:
            path = await save_profile_image(current_user.id, "face", file)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        current_user.face_photo_path = path
    elif not current_user.face_photo_path:
        raise HTTPException(status_code=400, detail="No face photo on file. Upload one first.")
    else:
        path = current_user.face_photo_path

    result = analyse_face_photo(path)

    current_user.colour_season = result.get("season", "Unknown")
    current_user.colour_palette_json = json.dumps(result)
    current_user.updated_at = datetime.utcnow()
    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return {
        "season": current_user.colour_season,
        "face_photo_url": get_image_url(current_user.face_photo_path),
        "palette": result,
    }
