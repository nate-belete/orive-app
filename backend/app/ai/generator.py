"""
Playbook generation engine — creates personalised occasion playbooks
using wardrobe data, user profile, and (optionally) GPT-4.
"""

import json
from typing import Any, Dict
from sqlmodel import Session
from .. import models
from ..settings import settings
from . import prompts


def generate_playbook(session: Session, occasion: models.Occasion, user: models.User | None = None) -> Dict[str, Any]:
    """Generate a playbook for an occasion. Uses mock or LLM based on settings."""
    if settings.ai_mode == "llm" and settings.openai_api_key:
        try:
            return _generate_with_llm(session, occasion, user)
        except Exception as e:
            print(f"LLM playbook generation failed: {e}. Falling back to mock.")
            return _generate_mock(session, occasion, user)
    return _generate_mock(session, occasion, user)


def _get_user(session: Session, user_id: int) -> models.User | None:
    return session.get(models.User, user_id)


def _generate_mock(session: Session, occasion: models.Occasion, user: models.User | None = None) -> Dict[str, Any]:
    """Generate a rich mock playbook."""
    from ..crud import get_closet_items

    if not user:
        user = _get_user(session, occasion.user_id)

    closet_items = get_closet_items(session, occasion.user_id)

    # If no items, return empty playbook with message
    if not closet_items:
        return _empty_playbook()

    # Build 3 outfits from wardrobe
    outfits = _build_mock_outfits(closet_items, occasion)

    # Build prep timeline scaled by importance
    prep = _build_mock_prep(occasion)

    # Build presence coaching
    presence = _build_mock_presence(occasion)

    # Build beauty tips
    beauty = _build_mock_beauty(occasion, user)

    return {
        "look": {
            "outfits": outfits,
            "upgrade_suggestions": [
                {
                    "item": "A versatile structured blazer",
                    "why": "Instantly elevates any outfit from casual to polished — perfect for layering over your existing pieces",
                    "priority": "high",
                },
                {
                    "item": "Classic leather belt in a complementary tone",
                    "why": "Ties separates together and adds intentional detail",
                    "priority": "medium",
                },
            ],
        },
        "prep": prep,
        "presence": presence,
        "beauty": beauty,
    }


def _empty_playbook() -> Dict[str, Any]:
    return {
        "look": {
            "outfits": [],
            "message": "Your wardrobe is empty. Upload some items first and we'll create outfit recommendations.",
            "upgrade_suggestions": [],
        },
        "prep": {
            "week_before": [],
            "three_days_before": [],
            "day_before": ["Add items to your wardrobe to get started"],
            "morning_of": [],
            "just_before": [],
            "pack_list": [],
        },
        "presence": {
            "mindset": [],
            "body_language": [],
            "conversation": {"openers": [], "topics_to_discuss": [], "graceful_exits": []},
            "pep_talk": "",
        },
        "beauty": {
            "skin_prep": [],
            "hair": "",
            "fragrance": "",
            "grooming_notes": [],
        },
    }


def _build_mock_outfits(closet_items: list, occasion: models.Occasion) -> list:
    """Create 3 mock outfit options from available wardrobe items."""
    tops = [i for i in closet_items if i.category in ("top", "dress", "outerwear")]
    bottoms = [i for i in closet_items if i.category in ("bottom", "dress")]
    shoes = [i for i in closet_items if i.category == "shoes"]
    accessories = [i for i in closet_items if i.category in ("accessory", "bag", "jewellery")]

    desired = occasion.desired_outcome or "confident"
    occasion_type = occasion.occasion_type or "event"

    outfit_themes = [
        (f"Option A — Polished & {desired.split(',')[0].strip().title()}", "This is your strongest choice — it balances formality with your personal style."),
        ("Option B — Comfortable & Confident", "A slightly more relaxed take that still looks intentional. Great if you want to move freely."),
        ("Option C — Elevated Classic", "Timeless and versatile — this look works across contexts and feels effortlessly put-together."),
    ]

    outfits = []
    for i, (title, reasoning_prefix) in enumerate(outfit_themes):
        items = []
        if tops:
            items.append({"id": tops[i % len(tops)].id, "name": tops[i % len(tops)].name, "category": tops[i % len(tops)].category})
        if bottoms and not any(it.get("category") == "dress" for it in items):
            items.append({"id": bottoms[i % len(bottoms)].id, "name": bottoms[i % len(bottoms)].name, "category": bottoms[i % len(bottoms)].category})
        if shoes:
            items.append({"id": shoes[i % len(shoes)].id, "name": shoes[i % len(shoes)].name, "category": shoes[i % len(shoes)].category})
        if accessories:
            items.append({"id": accessories[i % len(accessories)].id, "name": accessories[i % len(accessories)].name, "category": accessories[i % len(accessories)].category})

        if not items and closet_items:
            for j in range(min(3, len(closet_items))):
                idx = (i * 3 + j) % len(closet_items)
                ci = closet_items[idx]
                items.append({"id": ci.id, "name": ci.name, "category": ci.category})

        outfits.append({
            "title": title,
            "items": items,
            "reasoning": f"{reasoning_prefix} Matches the {occasion_type} setting and your goal of feeling {desired}.",
            "styling_notes": "Keep lines clean and let the pieces speak for themselves. Consider rolling sleeves for a relaxed confidence." if i == 1 else "Tuck in the top for a sharper silhouette. Add a watch or minimal jewellery for polish.",
            "risk_flags": [],
            "accessories": "A simple watch and minimal jewellery" if i == 0 else "A structured bag or scarf to add texture" if i == 1 else "Statement earrings or a bold belt",
        })

    return outfits


def _build_mock_prep(occasion: models.Occasion) -> Dict[str, Any]:
    """Build prep timeline scaled by importance."""
    importance = occasion.importance if hasattr(occasion, 'importance') else 3
    occasion_type = occasion.occasion_type or "event"

    prep = {
        "week_before": [],
        "three_days_before": [],
        "day_before": [
            "Steam or iron your selected outfit",
            "Check the weather forecast and adjust if needed",
            "Set your alarm 30 minutes earlier than you think you need",
        ],
        "morning_of": [
            "Shower and complete your grooming routine",
            "Dress in your chosen outfit — check in the mirror",
            "Double-check location, timing, and transport",
            "Eat something — don't arrive hungry",
        ],
        "just_before": [
            "Take 3 deep breaths",
            "Check your appearance one last time",
            "Silence your phone (or set to vibrate)",
        ],
        "pack_list": [
            "Phone and charger",
            "Breath mints or gum",
            "Small mirror for touch-ups",
        ],
    }

    if importance >= 3:
        prep["three_days_before"] = [
            f"Confirm your {occasion_type} details (time, location, parking)",
            "Try on your complete outfit — ensure fit and comfort",
            "Break in new shoes if applicable",
        ]

    if importance >= 4:
        prep["week_before"] = [
            f"Start thinking about your {occasion_type} — visualise how you want to show up",
            "Check your wardrobe for missing pieces — time to shop if needed",
            "Book any grooming appointments (haircut, nails, etc.)",
        ]
        prep["pack_list"].extend([
            "Business cards or contact info",
            "Tissue or handkerchief",
            "Emergency sewing kit",
        ])

    if importance >= 5:
        prep["week_before"].insert(0, f"Research the venue and attendees for your {occasion_type}")
        prep["week_before"].append("Plan your conversation topics and talking points")

    return prep


def _build_mock_presence(occasion: models.Occasion) -> Dict[str, Any]:
    """Build presence coaching cards."""
    desired = occasion.desired_outcome or "confident"
    occasion_type = occasion.occasion_type or "event"
    role = occasion.role if hasattr(occasion, 'role') else "guest"

    return {
        "mindset": [
            f"You belong here. You were invited to this {occasion_type} because you matter.",
            f"Focus on being present, not perfect. Your goal is to feel {desired}.",
            "Nerves are energy — channel them into enthusiasm and warmth.",
            "You've prepared well. Trust the process.",
        ],
        "body_language": [
            "Stand tall with shoulders back — it projects and creates confidence",
            "Maintain natural eye contact (3-5 seconds) when speaking",
            "Use open hand gestures — avoid crossing arms",
            "Mirror the energy of the person you're speaking with",
            "Smile genuinely when greeting people — it's contagious",
        ],
        "conversation": {
            "openers": [
                f"What brings you to this {occasion_type}?",
                "I love this venue — have you been here before?",
                "How do you know [the host/organiser]?",
            ],
            "topics_to_discuss": [
                "Recent travel or upcoming plans",
                "Shared interests based on the occasion context",
                "Positive observations about the event or venue",
            ],
            "graceful_exits": [
                "It was wonderful chatting — I'm going to grab a drink. Let's connect later!",
                "I should mingle a bit more, but I've really enjoyed our conversation.",
            ],
        },
        "pep_talk": f"You've got this. You've chosen an outfit that makes you feel {desired}, you've prepared thoughtfully, and you're walking in with intention. Remember — nobody is watching you as closely as you think they are. Be yourself, be present, and enjoy the {occasion_type}. You're going to be brilliant.",
    }


def _build_mock_beauty(occasion: models.Occasion, user: models.User | None = None) -> Dict[str, Any]:
    """Build beauty and grooming tips."""
    gender = user.gender if user else None

    base = {
        "skin_prep": [
            "Cleanse and moisturise the night before",
            "Apply SPF in the morning (even for indoor events)",
        ],
        "hair": "Keep it polished and intentional. If unsure, a classic style always works.",
        "fragrance": "Apply lightly — one spray to the wrist and dab on neck. Less is more.",
        "grooming_notes": [
            "Check nails are clean and trimmed",
            "Ensure no stray threads or lint on your outfit",
        ],
    }

    if gender == "female":
        base["skin_prep"].append("Consider a hydrating sheet mask the night before for glow")
        base["grooming_notes"].append("If wearing heels, pack flats for later in case")
        base["hair"] = "Style your hair to complement your neckline. Updos for high necklines, loose waves for open ones."
    elif gender == "male":
        base["grooming_notes"].append("Fresh shave or tidy beard the morning of")
        base["hair"] = "Clean, styled hair — use a light product for hold without stiffness."

    return base


def _generate_with_llm(session: Session, occasion: models.Occasion, user: models.User | None = None) -> Dict[str, Any]:
    """Generate playbook using GPT-4. Falls back to mock on failure."""
    import httpx
    from ..crud import get_closet_items

    if not user:
        user = _get_user(session, occasion.user_id)

    closet_items = get_closet_items(session, occasion.user_id)
    items_dict = [
        {
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "color": item.color,
            "pattern": item.pattern,
            "formality": item.formality,
            "season": item.season,
            "fabric": item.fabric,
            "brand": item.brand,
        }
        for item in closet_items
    ]

    occasion_dict = {
        "name": occasion.name,
        "occasion_type": occasion.occasion_type,
        "datetime_local": occasion.datetime_local.isoformat(),
        "location": occasion.location,
        "venue": getattr(occasion, 'venue', ''),
        "dress_code": occasion.dress_code,
        "weather_hint": occasion.weather_hint,
        "desired_outcome": occasion.desired_outcome,
        "comfort": occasion.comfort,
        "importance": getattr(occasion, 'importance', 3),
        "role": getattr(occasion, 'role', 'guest'),
        "attendees": getattr(occasion, 'attendees', ''),
        "description": getattr(occasion, 'description', ''),
    }

    user_profile = {}
    if user:
        user_profile = {
            "gender": user.gender,
            "body_type": user.body_type,
            "style_go_tos": user.style_go_tos,
            "style_no_goes": user.style_no_goes,
            "style_cant_wear": user.style_cant_wear,
            "colour_season": user.colour_season,
        }

    prompt = prompts.get_playbook_prompt(occasion_dict, items_dict, user_profile)

    with httpx.Client(timeout=60.0) as client:
        response = client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.openai_model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are Orivé, an expert personal stylist and occasion coach. Generate structured JSON playbooks that are warm, specific, and personalised.",
                    },
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.7,
                "max_tokens": 3000,
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

        # Validate and fill missing sections
        result.setdefault("look", {"outfits": [], "upgrade_suggestions": []})
        result["look"].setdefault("upgrade_suggestions", [])
        result.setdefault("prep", {})
        result["prep"].setdefault("week_before", [])
        result["prep"].setdefault("three_days_before", [])
        result["prep"].setdefault("day_before", [])
        result["prep"].setdefault("morning_of", [])
        result["prep"].setdefault("just_before", [])
        result["prep"].setdefault("pack_list", [])
        result.setdefault("presence", {})
        result["presence"].setdefault("mindset", [])
        result["presence"].setdefault("body_language", [])
        result["presence"].setdefault("conversation", {"openers": [], "topics_to_discuss": [], "graceful_exits": []})
        result["presence"].setdefault("pep_talk", "")
        result.setdefault("beauty", {})
        result["beauty"].setdefault("skin_prep", [])
        result["beauty"].setdefault("hair", "")
        result["beauty"].setdefault("fragrance", "")
        result["beauty"].setdefault("grooming_notes", [])

        return result
