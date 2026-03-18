"""
Prompt templates for LLM-based playbook generation.
"""

import json


def get_playbook_prompt(occasion: dict, closet_items: list[dict], user_profile: dict) -> str:
    return f"""You are Orivé, an expert personal styling and occasion coaching AI.
Generate a comprehensive, personalised playbook for the following occasion.

## Occasion Details
- Name: {occasion.get('name', '')}
- Type: {occasion.get('occasion_type')}
- Date/Time: {occasion.get('datetime_local')}
- Location: {occasion.get('location', 'Not specified')}
- Venue: {occasion.get('venue', 'Not specified')}
- Dress Code: {occasion.get('dress_code', 'Not specified')}
- Weather: {occasion.get('weather_hint', 'Not specified')}
- Desired Outcome: {occasion.get('desired_outcome', 'confident')}
- Comfort Level: {occasion.get('comfort', 'medium')}
- Importance: {occasion.get('importance', 3)}/5
- Role: {occasion.get('role', 'guest')}
- Attendees: {occasion.get('attendees', 'Not specified')}
- Description: {occasion.get('description', '')}

## User Profile
- Gender: {user_profile.get('gender', 'not specified')}
- Body Type: {user_profile.get('body_type', 'not specified')}
- Style Go-Tos: {user_profile.get('style_go_tos', 'not specified')}
- Style No-Goes: {user_profile.get('style_no_goes', 'not specified')}
- Can't Wear: {user_profile.get('style_cant_wear', 'not specified')}
- Colour Season: {user_profile.get('colour_season', 'not analysed')}

## Available Wardrobe Items
{format_closet_items(closet_items)}

## Instructions
Create 3 outfit options from the wardrobe above, a multi-phase prep timeline, beauty tips, and presence coaching. Be specific, personalised, and encouraging.

Return a JSON object with this exact structure:
{{
  "look": {{
    "outfits": [
      {{
        "title": "Option A — [descriptive name]",
        "items": [{{"id": 1, "name": "Item Name", "category": "top"}}, ...],
        "reasoning": "2-3 sentences explaining why this works for the occasion and the user's goals",
        "styling_notes": "Specific styling advice (how to wear, tuck, roll sleeves, etc.)",
        "risk_flags": ["potential issue 1"],
        "accessories": "Suggested accessories to complete the look"
      }},
      ... (exactly 3 outfits)
    ],
    "upgrade_suggestions": [
      {{
        "item": "What to add (e.g., 'A structured navy blazer')",
        "why": "Why this would help",
        "priority": "high/medium/low"
      }}
    ]
  }},
  "prep": {{
    "week_before": ["task1", "task2"],
    "three_days_before": ["task1", "task2"],
    "day_before": ["task1", "task2", "task3"],
    "morning_of": ["task1", "task2", "task3"],
    "just_before": ["task1", "task2"],
    "pack_list": ["item1", "item2"]
  }},
  "presence": {{
    "mindset": ["mindset tip 1", "mindset tip 2"],
    "body_language": ["body language tip 1", "body language tip 2"],
    "conversation": {{
      "openers": ["opener 1", "opener 2"],
      "topics_to_discuss": ["topic 1", "topic 2"],
      "graceful_exits": ["exit line 1"]
    }},
    "pep_talk": "A warm, encouraging 3-4 sentence pep talk for right before the event"
  }},
  "beauty": {{
    "skin_prep": ["step 1", "step 2"],
    "hair": "Hair styling recommendation",
    "fragrance": "Fragrance recommendation",
    "grooming_notes": ["note 1", "note 2"]
  }}
}}

IMPORTANT: Only reference items by ID and name from the wardrobe list above. If the wardrobe lacks items for a complete outfit, note it in upgrade_suggestions.
Return ONLY the JSON object, no markdown or explanation."""


def format_closet_items(items: list[dict]) -> str:
    if not items:
        return "No items in wardrobe yet."
    lines = []
    for item in items:
        parts = [
            f"ID:{item.get('id')}",
            item.get('name', 'Unnamed'),
            f"({item.get('category', '?')})",
            f"colour:{item.get('color', '?')}",
            f"pattern:{item.get('pattern', 'solid')}",
            f"formality:{item.get('formality', 3)}/5",
            f"season:{item.get('season', 'all')}",
        ]
        if item.get('fabric') and item['fabric'] != 'unknown':
            parts.append(f"fabric:{item['fabric']}")
        if item.get('brand'):
            parts.append(f"brand:{item['brand']}")
        lines.append(f"  - {' | '.join(parts)}")
    return "\n".join(lines)
