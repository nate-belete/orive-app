from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List
from ..db import get_session
from .. import models, schemas, crud
from ..auth.security import get_current_user

router = APIRouter()


@router.post("", response_model=schemas.FeedbackRead)
def create_feedback(
    feedback: schemas.FeedbackCreate,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    occasion = crud.get_occasion(session, feedback.occasion_id, current_user.id)
    if not occasion:
        raise HTTPException(status_code=404, detail="Occasion not found")

    playbook = crud.get_playbook(session, feedback.playbook_id)
    if not playbook:
        raise HTTPException(status_code=404, detail="Playbook not found")

    db_feedback = models.Feedback(**feedback.model_dump())
    return crud.create_feedback(session, db_feedback)


@router.get("", response_model=List[schemas.FeedbackRead])
def list_feedback(
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_all_feedback(session)


@router.get("/occasion/{occasion_id}", response_model=List[schemas.FeedbackRead])
def get_feedback_by_occasion(
    occasion_id: int,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_feedback_by_occasion(session, occasion_id)
