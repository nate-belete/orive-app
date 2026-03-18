from sqlmodel import Session, select
from typing import List, Optional
from . import models


# Closet CRUD
def create_closet_item(session: Session, item: models.ClosetItem) -> models.ClosetItem:
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def get_closet_items(session: Session, user_id: int) -> List[models.ClosetItem]:
    statement = (
        select(models.ClosetItem)
        .where(models.ClosetItem.user_id == user_id)
        .order_by(models.ClosetItem.created_at.desc())
    )
    return list(session.exec(statement).all())


def get_closet_item(session: Session, item_id: int, user_id: int) -> Optional[models.ClosetItem]:
    item = session.get(models.ClosetItem, item_id)
    if item and item.user_id == user_id:
        return item
    return None


def delete_closet_item(session: Session, item_id: int, user_id: int) -> bool:
    item = session.get(models.ClosetItem, item_id)
    if item and item.user_id == user_id:
        session.delete(item)
        session.commit()
        return True
    return False


# Occasion CRUD
def create_occasion(session: Session, occasion: models.Occasion) -> models.Occasion:
    session.add(occasion)
    session.commit()
    session.refresh(occasion)
    return occasion


def get_occasions(session: Session, user_id: int) -> List[models.Occasion]:
    statement = (
        select(models.Occasion)
        .where(models.Occasion.user_id == user_id)
        .where(models.Occasion.is_deleted == False)
        .order_by(models.Occasion.datetime_local.desc())
    )
    return list(session.exec(statement).all())


def get_occasion(session: Session, occasion_id: int, user_id: int) -> Optional[models.Occasion]:
    occasion = session.get(models.Occasion, occasion_id)
    if occasion and occasion.user_id == user_id and not occasion.is_deleted:
        return occasion
    return None


def update_occasion(session: Session, occasion: models.Occasion) -> models.Occasion:
    session.add(occasion)
    session.commit()
    session.refresh(occasion)
    return occasion


# Playbook CRUD
def create_playbook(session: Session, playbook: models.Playbook) -> models.Playbook:
    session.add(playbook)
    session.commit()
    session.refresh(playbook)
    return playbook


def get_playbook_by_occasion(session: Session, occasion_id: int) -> Optional[models.Playbook]:
    statement = select(models.Playbook).where(models.Playbook.occasion_id == occasion_id)
    return session.exec(statement).first()


def get_playbook(session: Session, playbook_id: int) -> Optional[models.Playbook]:
    return session.get(models.Playbook, playbook_id)


def delete_playbook(session: Session, playbook_id: int) -> bool:
    playbook = session.get(models.Playbook, playbook_id)
    if playbook:
        session.delete(playbook)
        session.commit()
        return True
    return False


# Feedback CRUD
def create_feedback(session: Session, feedback: models.Feedback) -> models.Feedback:
    session.add(feedback)
    session.commit()
    session.refresh(feedback)
    return feedback


def get_feedback_by_occasion(session: Session, occasion_id: int) -> List[models.Feedback]:
    statement = select(models.Feedback).where(models.Feedback.occasion_id == occasion_id)
    return list(session.exec(statement).all())


def get_all_feedback(session: Session) -> List[models.Feedback]:
    statement = select(models.Feedback).order_by(models.Feedback.created_at.desc())
    return list(session.exec(statement).all())
