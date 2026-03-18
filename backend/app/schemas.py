from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Any


class ClosetItemCreate(BaseModel):
    name: str = ""
    category: str = ""
    color: str = ""
    pattern: str = "solid"
    formality: int = Field(ge=1, le=5, default=3)
    season: str = "all"
    fabric: str = "unknown"
    brand: Optional[str] = None
    size: Optional[str] = None
    notes: str = ""


class ClosetItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    color: Optional[str] = None
    pattern: Optional[str] = None
    formality: Optional[int] = Field(ge=1, le=5, default=None)
    season: Optional[str] = None
    fabric: Optional[str] = None
    brand: Optional[str] = None
    size: Optional[str] = None
    notes: Optional[str] = None
    is_favourite: Optional[bool] = None


class ClosetItemRead(BaseModel):
    id: int
    user_id: int
    name: str
    category: str
    color: str
    pattern: str
    formality: int
    season: str
    fabric: str
    brand: Optional[str] = None
    size: Optional[str] = None
    notes: str
    image_path: Optional[str] = None
    image_url: Optional[str] = None
    ai_tagged: bool
    is_favourite: bool = False
    created_at: datetime


class OccasionCreate(BaseModel):
    name: str = ""
    occasion_type: str
    datetime_local: datetime
    end_datetime: Optional[datetime] = None
    location: str = ""
    venue: str = ""
    description: str = ""
    dress_code: str = ""
    comfort: str = "medium"
    desired_outcome: str = "confident"
    budget: int = 0
    weather_hint: str = ""
    importance: int = Field(ge=1, le=5, default=3)
    attendees: str = ""
    role: str = ""


class OccasionUpdate(BaseModel):
    name: Optional[str] = None
    occasion_type: Optional[str] = None
    datetime_local: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    location: Optional[str] = None
    venue: Optional[str] = None
    description: Optional[str] = None
    dress_code: Optional[str] = None
    comfort: Optional[str] = None
    desired_outcome: Optional[str] = None
    budget: Optional[int] = None
    weather_hint: Optional[str] = None
    importance: Optional[int] = Field(ge=1, le=5, default=None)
    attendees: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None


class OccasionRead(BaseModel):
    id: int
    user_id: int
    name: str
    occasion_type: str
    datetime_local: datetime
    end_datetime: Optional[datetime] = None
    location: str
    venue: str
    description: str
    dress_code: str
    comfort: str
    desired_outcome: str
    budget: int
    weather_hint: str
    importance: int
    attendees: str
    role: str
    status: str
    playbook_generated: bool
    created_at: datetime
    updated_at: datetime


class PlaybookGenerateRequest(BaseModel):
    occasion_id: int


class PlaybookRead(BaseModel):
    id: int
    occasion_id: int
    look: Any
    beauty: Any
    prep: Any
    presence: Any
    created_at: datetime


class FeedbackCreate(BaseModel):
    occasion_id: int
    playbook_id: int
    wore_it: bool = False
    confidence_rating: int = Field(ge=1, le=5, default=3)
    notes: str = ""
    would_repeat: bool = False


class FeedbackRead(FeedbackCreate):
    id: int
    created_at: datetime
