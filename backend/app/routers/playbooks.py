import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from ..db import get_session
from .. import models, schemas, crud
from ..ai.generator import generate_playbook
from ..auth.security import get_current_user

router = APIRouter()


VALID_MODULES = {"look", "beauty", "prep", "presence"}


@router.post("/generate", response_model=schemas.PlaybookRead)
def generate_playbook_for_occasion(
    request: schemas.PlaybookGenerateRequest,
    force: bool = Query(default=False, description="Force regenerate even if playbook exists"),
    module: str = Query(default="", description="Partial regen: 'look', 'beauty', 'prep', or 'presence'. Empty = full regen."),
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    occasion = crud.get_occasion(session, request.occasion_id, current_user.id)
    if not occasion:
        raise HTTPException(status_code=404, detail="Occasion not found")

    existing = crud.get_playbook_by_occasion(session, request.occasion_id)

    # Partial regeneration: only regen one module, keep the rest
    if module and module in VALID_MODULES and existing:
        playbook_data = generate_playbook(session, occasion, current_user)
        module_key = f"{module}_json"
        setattr(existing, module_key, json.dumps(playbook_data[module]))
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return _playbook_to_read(existing)

    if existing and not force:
        return _playbook_to_read(existing)

    playbook_data = generate_playbook(session, occasion, current_user)

    if existing and force:
        crud.delete_playbook(session, existing.id)

    db_playbook = models.Playbook(
        occasion_id=request.occasion_id,
        look_json=json.dumps(playbook_data["look"]),
        beauty_json=json.dumps(playbook_data["beauty"]),
        prep_json=json.dumps(playbook_data["prep"]),
        presence_json=json.dumps(playbook_data["presence"]),
    )
    created = crud.create_playbook(session, db_playbook)

    # Mark occasion as playbook-generated
    occasion.playbook_generated = True
    occasion.updated_at = datetime.utcnow()
    session.add(occasion)
    session.commit()

    return _playbook_to_read(created)


@router.get("/occasion/{occasion_id}", response_model=schemas.PlaybookRead)
def get_playbook_by_occasion(
    occasion_id: int,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    occasion = crud.get_occasion(session, occasion_id, current_user.id)
    if not occasion:
        raise HTTPException(status_code=404, detail="Occasion not found")

    playbook = crud.get_playbook_by_occasion(session, occasion_id)
    if not playbook:
        raise HTTPException(status_code=404, detail="Playbook not found for this occasion")
    return _playbook_to_read(playbook)


@router.get("/{playbook_id}", response_model=schemas.PlaybookRead)
def get_playbook(
    playbook_id: int,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    playbook = crud.get_playbook(session, playbook_id)
    if not playbook:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return _playbook_to_read(playbook)


def _playbook_to_read(playbook: models.Playbook) -> schemas.PlaybookRead:
    return schemas.PlaybookRead(
        id=playbook.id,
        occasion_id=playbook.occasion_id,
        look=json.loads(playbook.look_json),
        beauty=json.loads(playbook.beauty_json),
        prep=json.loads(playbook.prep_json),
        presence=json.loads(playbook.presence_json),
        created_at=playbook.created_at,
    )
