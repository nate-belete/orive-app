from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session
from ..db import get_session
from ..utils.seed import seed_all

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "ok"}

@router.post("/demo/load")
def load_demo_data(session: Session = Depends(get_session)):
    """Load complete demo data: closet items, occasions, and playbooks."""
    try:
        result = seed_all(clear_existing=True, session=session)
        return {
            "status": "success",
            "message": "Demo data loaded successfully",
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load demo data: {str(e)}")

