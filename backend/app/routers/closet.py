from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select
from typing import List, Optional
from ..db import get_session
from .. import models, schemas
from ..auth.security import get_current_user
from ..services.storage import save_wardrobe_image, delete_image, get_image_url
from ..services.ai_tagger import tag_garment_image

router = APIRouter()


def _item_to_read(item: models.ClosetItem) -> schemas.ClosetItemRead:
    return schemas.ClosetItemRead(
        id=item.id,
        user_id=item.user_id,
        name=item.name,
        category=item.category,
        color=item.color,
        pattern=item.pattern,
        formality=item.formality,
        season=item.season,
        fabric=item.fabric,
        brand=item.brand,
        size=item.size,
        notes=item.notes,
        image_path=item.image_path,
        image_url=get_image_url(item.image_path),
        ai_tagged=item.ai_tagged,
        is_favourite=item.is_favourite,
        created_at=item.created_at,
    )


@router.post("/items", response_model=schemas.ClosetItemRead)
async def create_closet_item(
    name: str = Form(""),
    category: str = Form(""),
    color: str = Form(""),
    pattern: str = Form("solid"),
    formality: int = Form(3),
    season: str = Form("all"),
    fabric: str = Form("unknown"),
    brand: Optional[str] = Form(None),
    size: Optional[str] = Form(None),
    notes: str = Form(""),
    image: Optional[UploadFile] = File(None),
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    """Create a wardrobe item, optionally with an image. If image provided, AI tagging is attempted."""
    image_path = None
    ai_tagged = False

    # Save image if provided
    if image and image.filename:
        try:
            image_path = await save_wardrobe_image(current_user.id, image)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        # Attempt AI tagging
        tags = tag_garment_image(image_path)
        if tags and tags.get("name") != "Uploaded Garment":
            ai_tagged = True
            # AI tags override empty form fields only
            if not name:
                name = tags.get("name", "Uploaded Garment")
            if not category:
                category = tags.get("category", "top")
            if not color:
                color = tags.get("color", "unknown")
            pattern = tags.get("pattern", pattern)
            formality = tags.get("formality", formality)
            season = tags.get("season", season)
            fabric = tags.get("fabric", fabric)
            brand = tags.get("brand", brand)

    # Ensure required fields have defaults
    if not name:
        name = "Untitled Item"
    if not category:
        category = "top"
    if not color:
        color = "unknown"

    db_item = models.ClosetItem(
        user_id=current_user.id,
        name=name,
        category=category,
        color=color,
        pattern=pattern,
        formality=max(1, min(5, formality)),
        season=season,
        fabric=fabric,
        brand=brand,
        size=size,
        notes=notes,
        image_path=image_path,
        ai_tagged=ai_tagged,
    )
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return _item_to_read(db_item)


@router.get("/items", response_model=List[schemas.ClosetItemRead])
def list_closet_items(
    category: Optional[str] = None,
    season: Optional[str] = None,
    search: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    """List wardrobe items with optional filters."""
    query = (
        select(models.ClosetItem)
        .where(models.ClosetItem.user_id == current_user.id)
        .where(models.ClosetItem.is_deleted == False)
        .order_by(models.ClosetItem.created_at.desc())
    )

    if category and category != "all":
        query = query.where(models.ClosetItem.category == category)
    if season and season != "all":
        query = query.where(models.ClosetItem.season == season)

    items = list(session.exec(query).all())

    # Text search (simple case-insensitive contains on name, color, notes)
    if search:
        search_lower = search.lower()
        items = [
            i for i in items
            if search_lower in i.name.lower()
            or search_lower in i.color.lower()
            or search_lower in i.notes.lower()
            or (i.brand and search_lower in i.brand.lower())
        ]

    return [_item_to_read(i) for i in items]


@router.get("/items/{item_id}", response_model=schemas.ClosetItemRead)
def get_closet_item(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    item = session.get(models.ClosetItem, item_id)
    if not item or item.user_id != current_user.id or item.is_deleted:
        raise HTTPException(status_code=404, detail="Closet item not found")
    return _item_to_read(item)


@router.patch("/items/{item_id}", response_model=schemas.ClosetItemRead)
def update_closet_item(
    item_id: int,
    updates: schemas.ClosetItemUpdate,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    """Update wardrobe item tags (manual editing)."""
    item = session.get(models.ClosetItem, item_id)
    if not item or item.user_id != current_user.id or item.is_deleted:
        raise HTTPException(status_code=404, detail="Closet item not found")

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    session.add(item)
    session.commit()
    session.refresh(item)
    return _item_to_read(item)


@router.delete("/items/{item_id}")
def delete_closet_item(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    """Soft-delete a wardrobe item."""
    item = session.get(models.ClosetItem, item_id)
    if not item or item.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Closet item not found")

    item.is_deleted = True
    session.add(item)
    session.commit()
    return {"message": "Item removed from wardrobe"}


@router.get("/trash", response_model=List[schemas.ClosetItemRead])
def list_deleted_items(
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    """List soft-deleted wardrobe items (trash)."""
    query = (
        select(models.ClosetItem)
        .where(models.ClosetItem.user_id == current_user.id)
        .where(models.ClosetItem.is_deleted == True)
        .order_by(models.ClosetItem.created_at.desc())
    )
    items = list(session.exec(query).all())
    return [_item_to_read(i) for i in items]


@router.post("/items/{item_id}/restore", response_model=schemas.ClosetItemRead)
def restore_closet_item(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    """Restore a soft-deleted wardrobe item."""
    item = session.get(models.ClosetItem, item_id)
    if not item or item.user_id != current_user.id or not item.is_deleted:
        raise HTTPException(status_code=404, detail="Deleted item not found")
    item.is_deleted = False
    session.add(item)
    session.commit()
    session.refresh(item)
    return _item_to_read(item)


@router.post("/items/{item_id}/retag", response_model=schemas.ClosetItemRead)
def retag_closet_item(
    item_id: int,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
):
    """Re-run AI tagging on an existing item's image."""
    item = session.get(models.ClosetItem, item_id)
    if not item or item.user_id != current_user.id or item.is_deleted:
        raise HTTPException(status_code=404, detail="Closet item not found")

    if not item.image_path:
        raise HTTPException(status_code=400, detail="Item has no image to analyse")

    tags = tag_garment_image(item.image_path)
    if tags and tags.get("name") != "Uploaded Garment":
        item.name = tags.get("name", item.name)
        item.category = tags.get("category", item.category)
        item.color = tags.get("color", item.color)
        item.pattern = tags.get("pattern", item.pattern)
        item.formality = tags.get("formality", item.formality)
        item.season = tags.get("season", item.season)
        item.fabric = tags.get("fabric", item.fabric)
        item.brand = tags.get("brand", item.brand)
        item.ai_tagged = True

        session.add(item)
        session.commit()
        session.refresh(item)

    return _item_to_read(item)
