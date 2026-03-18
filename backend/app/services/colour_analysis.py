"""
AI colour analysis service — uses GPT-4 Vision to determine seasonal colour palette
from a face photo. Uses the 12-season colour analysis model.
"""

import json
import base64
from pathlib import Path
from typing import Optional
from ..settings import settings

UPLOAD_DIR = Path(__file__).parent.parent.parent / "data" / "uploads"

SEASONS_12 = [
    "Light Spring", "Warm Spring", "Clear Spring",
    "Light Summer", "Cool Summer", "Soft Summer",
    "Warm Autumn", "Soft Autumn", "Deep Autumn",
    "Cool Winter", "Clear Winter", "Deep Winter",
]

MOCK_RESULT = {
    "season": "Warm Autumn",
    "sub_season": "Soft Autumn",
    "description": "Your warm, muted colouring harmonises beautifully with earthy, rich tones. You have a natural warmth in your skin, eyes, and hair that comes alive with autumn's palette.",
    "characteristics": {
        "skin_undertone": "warm",
        "skin_description": "Warm with golden or peachy undertones",
        "eye_colour": "brown",
        "hair_colour": "medium brown",
    },
    "best_colours": [
        {"name": "Terracotta", "hex": "#C4622D"},
        {"name": "Olive Green", "hex": "#708238"},
        {"name": "Warm Camel", "hex": "#C19A6B"},
        {"name": "Burnt Sienna", "hex": "#A0522D"},
        {"name": "Teal", "hex": "#367588"},
        {"name": "Mustard Gold", "hex": "#D4A017"},
        {"name": "Warm Cream", "hex": "#F5E6CC"},
        {"name": "Burgundy", "hex": "#722F37"},
        {"name": "Forest Green", "hex": "#228B22"},
        {"name": "Chocolate Brown", "hex": "#3B1E08"},
        {"name": "Rust", "hex": "#B7410E"},
        {"name": "Warm Coral", "hex": "#E8725C"},
    ],
    "best_neutrals": [
        {"name": "Warm White", "hex": "#FAF0E6"},
        {"name": "Camel", "hex": "#C19A6B"},
        {"name": "Warm Grey", "hex": "#8B8378"},
        {"name": "Chocolate", "hex": "#3B1E08"},
        {"name": "Navy (warm)", "hex": "#1B3A4B"},
    ],
    "avoid_colours": [
        {"name": "Icy Pink", "hex": "#F8C8DC"},
        {"name": "Cool Grey", "hex": "#808080"},
        {"name": "Bright White", "hex": "#FFFFFF"},
        {"name": "Electric Blue", "hex": "#0000FF"},
        {"name": "Fuchsia", "hex": "#FF00FF"},
    ],
    "styling_tips": [
        "Layer warm neutrals — camel, chocolate, and olive — for an effortlessly polished base.",
        "Your gold jewellery game is strong. Rose gold also works beautifully with your colouring.",
        "For lips, lean into warm berry shades, brick reds, and muted corals rather than cool pinks.",
        "Your best denim wash is a warm, dark indigo rather than cool grey or acid wash.",
        "When wearing black, add a warm scarf or warm-toned accessory near your face to soften the contrast.",
    ],
}


def analyse_face_photo(image_path: str) -> dict:
    """
    Analyse a face photo and return colour season + palette.
    Returns a rich dict with season, colours, tips.
    """
    if settings.ai_mode != "llm" or not settings.openai_api_key:
        return dict(MOCK_RESULT)

    try:
        return _analyse_with_gpt4_vision(image_path)
    except Exception as e:
        print(f"Colour analysis failed: {e}. Returning mock result.")
        return dict(MOCK_RESULT)


def _analyse_with_gpt4_vision(image_path: str) -> dict:
    """Call GPT-4 Vision for colour analysis."""
    import httpx

    full_path = UPLOAD_DIR / image_path
    if not full_path.exists():
        return dict(MOCK_RESULT)

    with open(full_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    ext = full_path.suffix.lower()
    media_type = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }.get(ext, "image/jpeg")

    prompt = f"""You are an expert personal colour analyst using the 12-season colour analysis system.

Analyse this face photo and determine the person's seasonal colour type.

The 12 seasons are: {json.dumps(SEASONS_12)}

Return a JSON object with these exact fields:

{{
  "season": "<one of the 12 seasons>",
  "sub_season": "<the same season name>",
  "description": "<2-3 sentence personalised description of their colouring and why this season fits>",
  "characteristics": {{
    "skin_undertone": "<warm/cool/neutral>",
    "skin_description": "<brief description>",
    "eye_colour": "<colour>",
    "hair_colour": "<colour>"
  }},
  "best_colours": [
    {{"name": "<colour name>", "hex": "<hex code>"}},
    ... (exactly 12 colours)
  ],
  "best_neutrals": [
    {{"name": "<neutral name>", "hex": "<hex code>"}},
    ... (exactly 5 neutrals)
  ],
  "avoid_colours": [
    {{"name": "<colour name>", "hex": "<hex code>"}},
    ... (exactly 5 colours to avoid)
  ],
  "styling_tips": [
    "<practical styling tip 1>",
    "<practical styling tip 2>",
    "<practical styling tip 3>",
    "<practical styling tip 4>",
    "<practical styling tip 5>"
  ]
}}

Be specific and personalised. The best_colours should be the person's MOST flattering shades.
Return ONLY the JSON object, no markdown or explanation."""

    with httpx.Client(timeout=60.0) as client:
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
                                    "detail": "high",
                                },
                            },
                        ],
                    }
                ],
                "max_tokens": 1500,
                "temperature": 0.3,
            },
        )
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        result = json.loads(content)

        # Validate season
        if result.get("season") not in SEASONS_12:
            result["season"] = "Warm Autumn"

        return result
