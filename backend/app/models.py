from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: str = ""
    first_name: str = ""
    last_name: str = ""
    is_active: bool = True
    onboarding_complete: bool = False

    # Profile fields (populated during onboarding)
    gender: str | None = None  # male, female, non-binary
    date_of_birth: str | None = None  # ISO date string
    postcode: str | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    body_type: str | None = None  # hourglass, triangle, inverted_triangle, rectangle, round
    body_photo_path: str | None = None
    face_photo_path: str | None = None
    style_go_tos: str | None = None  # free text
    style_no_goes: str | None = None  # free text
    style_cant_wear: str | None = None  # free text

    # Colour analysis results (populated after analysis)
    colour_season: str | None = None  # e.g. "Cool Summer"
    colour_palette_json: str | None = None  # JSON string of palette data

    # Password reset
    reset_token: str | None = None
    reset_token_expires: datetime | None = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ClosetItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    name: str
    category: str  # top, bottom, dress, outerwear, shoes, accessory, bag, jewellery, swimwear, activewear
    color: str
    pattern: str = "solid"  # solid, striped, checked, floral, printed, textured, geometric, other
    formality: int = 3  # 1 casual - 5 formal
    season: str = "all"  # all, summer, winter, spring, fall
    fabric: str = "unknown"  # cotton, wool, silk, polyester, denim, leather, etc.
    brand: str | None = None
    size: str | None = None  # XS, S, M, L, XL, XXL, 0-24, etc.
    notes: str = ""
    image_path: str | None = None
    ai_tagged: bool = False  # True if tags came from AI analysis
    is_favourite: bool = False  # user-marked favourite
    is_deleted: bool = False  # soft delete
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Occasion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)

    # Core details
    name: str = ""  # user-given name e.g. "Sarah's Wedding"
    occasion_type: str  # wedding, interview, date, meeting, dinner, party, graduation, conference, funeral, holiday, other
    datetime_local: datetime
    end_datetime: datetime | None = None  # optional end time
    location: str = ""
    venue: str = ""  # specific venue name
    description: str = ""  # additional context

    # Dress code & style
    dress_code: str = ""  # casual, smart_casual, business_casual, business_formal, black_tie, white_tie, cocktail, semi_formal
    comfort: str = "medium"  # minimal, medium, maximum
    desired_outcome: str = "confident"  # how the user wants to feel

    # Logistics
    budget: int = 0  # outfit budget in user's currency
    weather_hint: str = ""  # manual weather hint
    importance: int = 3  # 1-5 scale (drives prep timeline length)
    attendees: str = ""  # free text: who will be there
    role: str = ""  # user's role: guest, host, speaker, interviewee, etc.

    # Status
    status: str = "upcoming"  # upcoming, today, past, cancelled
    playbook_generated: bool = False
    is_deleted: bool = False  # soft delete

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Playbook(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    occasion_id: int = Field(index=True)

    # JSON blobs as strings for POC simplicity
    look_json: str
    beauty_json: str
    prep_json: str
    presence_json: str

    created_at: datetime = Field(default_factory=datetime.utcnow)

class Feedback(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    occasion_id: int = Field(index=True)
    playbook_id: int = Field(index=True)

    wore_it: bool = False
    confidence_rating: int = 3  # 1-5
    notes: str = ""
    would_repeat: bool = False

    created_at: datetime = Field(default_factory=datetime.utcnow)

