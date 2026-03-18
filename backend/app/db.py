import os
from sqlmodel import SQLModel, create_engine, Session
from .settings import settings

def ensure_dirs():
    os.makedirs("./data", exist_ok=True)
    os.makedirs("./data/uploads", exist_ok=True)

ensure_dirs()

engine = create_engine(settings.database_url, echo=False)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

