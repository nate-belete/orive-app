from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from .settings import settings
from .db import init_db
from .routers import health, closet, occasions, playbooks, feedback, colour
from .auth.router import router as auth_router

app = FastAPI(title="Orivé API")

cors_origins = settings.cors_origins
allow_creds = True
if settings.app_env == "local":
    cors_origins = ["*"]
    allow_creds = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_creds,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _run_migrations():
    """Add new columns to existing tables (lightweight migration for POC)."""
    import sqlite3
    from .settings import settings as s
    db_path = s.database_url.replace("sqlite:///", "")
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        # Check and add is_favourite to closetitem
        cur.execute("PRAGMA table_info(closetitem)")
        cols = [row[1] for row in cur.fetchall()]
        if "is_favourite" not in cols:
            cur.execute("ALTER TABLE closetitem ADD COLUMN is_favourite BOOLEAN DEFAULT 0")
            conn.commit()
            print("[MIGRATE] Added is_favourite column to closetitem")
        if "size" not in cols:
            cur.execute("ALTER TABLE closetitem ADD COLUMN size TEXT DEFAULT NULL")
            conn.commit()
            print("[MIGRATE] Added size column to closetitem")

        # User table: add first_name, last_name
        cur.execute("PRAGMA table_info(user)")
        user_cols = [row[1] for row in cur.fetchall()]
        if "first_name" not in user_cols:
            cur.execute("ALTER TABLE user ADD COLUMN first_name TEXT DEFAULT ''")
            cur.execute("ALTER TABLE user ADD COLUMN last_name TEXT DEFAULT ''")
            # Backfill from full_name
            cur.execute("SELECT id, full_name FROM user WHERE first_name = '' AND full_name != ''")
            for row in cur.fetchall():
                uid, fn = row
                parts = fn.split(" ", 1)
                first = parts[0]
                last = parts[1] if len(parts) > 1 else ""
                cur.execute("UPDATE user SET first_name=?, last_name=? WHERE id=?", (first, last, uid))
            conn.commit()
            print("[MIGRATE] Added first_name, last_name to user (backfilled from full_name)")
        conn.close()
    except Exception as e:
        print(f"[MIGRATE] Migration skipped: {e}")


@app.on_event("startup")
def on_startup():
    init_db()
    _run_migrations()
    # Auto-seed demo data on first run (if database is empty)
    from .utils.seed import seed_demo_data
    seed_demo_data()


# Auth routes
app.include_router(auth_router, prefix="/auth", tags=["auth"])

# App routes
app.include_router(health.router)
app.include_router(closet.router, prefix="/closet", tags=["closet"])
app.include_router(occasions.router, prefix="/occasions", tags=["occasions"])
app.include_router(playbooks.router, prefix="/playbooks", tags=["playbooks"])
app.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
app.include_router(colour.router, prefix="/colour", tags=["colour-analysis"])

# Serve uploaded images
uploads_path = Path(__file__).parent.parent / "data" / "uploads"
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")


@app.get("/")
def root():
    return {
        "app": "Orivé API",
        "version": "0.2.0",
        "docs": "/docs",
    }
