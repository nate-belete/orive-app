from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import List, Optional
from ..db import get_session
from .. import models, schemas, crud
from ..auth.security import get_current_user

router = APIRouter()


@router.post("", response_model=schemas.OccasionRead)
def create_occasion(
    occasion: schemas.OccasionCreate,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    # Auto-generate name if not provided
    name = occasion.name
    if not name:
        date_str = occasion.datetime_local.strftime("%b %d")
        name = f"{occasion.occasion_type.replace('_', ' ').title()} — {date_str}"

    db_occasion = models.Occasion(
        **occasion.model_dump(exclude={"name"}),
        name=name,
        user_id=current_user.id,
    )
    return crud.create_occasion(session, db_occasion)


@router.get("", response_model=List[schemas.OccasionRead])
def list_occasions(
    status: Optional[str] = Query(None, description="Filter by status: upcoming, past, cancelled"),
    occasion_type: Optional[str] = Query(None, description="Filter by type"),
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    occasions = crud.get_occasions(session, current_user.id)

    # Auto-update statuses based on current time
    now = datetime.utcnow()
    for occ in occasions:
        if occ.status not in ("cancelled",):
            if occ.datetime_local.date() == now.date():
                occ.status = "today"
            elif occ.datetime_local < now:
                occ.status = "past"
            else:
                occ.status = "upcoming"
            session.add(occ)
    session.commit()

    # Apply filters
    if status:
        occasions = [o for o in occasions if o.status == status]
    if occasion_type:
        occasions = [o for o in occasions if o.occasion_type == occasion_type]

    return occasions


@router.get("/{occasion_id}", response_model=schemas.OccasionRead)
def get_occasion(
    occasion_id: int,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    occasion = crud.get_occasion(session, occasion_id, current_user.id)
    if not occasion:
        raise HTTPException(status_code=404, detail="Occasion not found")
    return occasion


@router.patch("/{occasion_id}", response_model=schemas.OccasionRead)
def update_occasion(
    occasion_id: int,
    data: schemas.OccasionUpdate,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    occasion = crud.get_occasion(session, occasion_id, current_user.id)
    if not occasion:
        raise HTTPException(status_code=404, detail="Occasion not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(occasion, key, value)
    occasion.updated_at = datetime.utcnow()

    return crud.update_occasion(session, occasion)


@router.delete("/{occasion_id}")
def delete_occasion(
    occasion_id: int,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    occasion = crud.get_occasion(session, occasion_id, current_user.id)
    if not occasion:
        raise HTTPException(status_code=404, detail="Occasion not found")

    occasion.is_deleted = True
    occasion.updated_at = datetime.utcnow()
    session.add(occasion)
    session.commit()
    return {"detail": "Occasion deleted"}
