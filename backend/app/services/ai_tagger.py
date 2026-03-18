"""
AI garment tagging service — uses GPT-4 Vision to analyse garment photos.
Falls back to manual entry when AI_MODE=mock or no API key.
"""

import json
import base64
from pathlib import Path
from typing import Optional
from ..settings import settings

UPLOAD_DIR = Path(__file__).parent.parent.parent / "data" / "uploads"

GARMENT_CATEGORIES = [
    "top", "bottom", "dress", "outerwear", "shoes",
    "accessory", "bag", "jewellery", "swimwear", "activewear",
]

MOCK_TAGS = {
    "name": "Uploaded Garment",
    "category": "top",
    "color": "unknown",
    "pattern": "solid",
    "formality": 3,
    "season": "all",
    "fabric": "unknown",
    "brand": None,
}


def tag_garment_image(image_path: str) -> dict:
    """
    Analyse a garment image and return structured tags.
    Returns dict with: name, category, color, pattern, formality, season, fabric, brand
    """
    if settings.ai_mode != "llm" or not settings.openai_api_key:
        return dict(MOCK_TAGS)

    try:
        return _tag_with_gpt4_vision(image_path)
    except Exception as e:
        print(f"AI tagging failed: {e}. Returning mock tags.")
        return dict(MOCK_TAGS)


def _tag_with_gpt4_vision(image_path: str) -> dict:
    """Call GPT-4 Vision to analyse a garment photo."""
    import httpx

    full_path = UPLOAD_DIR / image_path
    if not full_path.exists():
        return dict(MOCK_TAGS)

    with open(full_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    ext = full_path.suffix.lower()
    media_type = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }.get(ext, "image/jpeg")

    prompt = f"""Analyse this garment photo and return a JSON object with these exact fields:

- "name": short descriptive name (e.g. "Navy Wool Blazer", "White Cotton T-Shirt")
- "category": one of {json.dumps(GARMENT_CATEGORIES)}
- "color": primary colour name (e.g. "navy blue", "charcoal grey", "cream")  
- "pattern": one of ["solid", "striped", "checked", "floral", "printed", "textured", "geometric", "other"]
- "formality": integer 1-5 (1=very casual, 3=smart casual, 5=black tie)
- "season": one of ["all", "summer", "winter", "spring", "fall"]
- "fabric": fabric type if identifiable (e.g. "cotton", "wool", "silk", "polyester", "denim", "leather", "unknown")
- "brand": brand name if visible, otherwise null

Return ONLY the JSON object, no markdown or explanation."""

    with httpx.Client(timeout=30.0) as client:
        response = client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{media_type};base64,{image_data}",
                                    "detail": "low",
                                },
                            },
                        ],
                    }
                ],
                "max_tokens": 300,
                "temperature": 0.2,
            },
        )
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]

        # Strip markdown code fences if present
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        tags = json.loads(content)

        # Validate and sanitise
        if tags.get("category") not in GARMENT_CATEGORIES:
            tags["category"] = "top"
        tags["formality"] = max(1, min(5, int(tags.get("formality", 3))))
        if tags.get("season") not in ["all", "summer", "winter", "spring", "fall"]:
            tags["season"] = "all"

        return tags
