"""
Comprehensive demo data seeder for Orivé POC.
Creates 3 fully-fleshed-out users with wardrobe, occasions, playbooks, and colour analysis.
Auto-runs on first startup if the database is empty.
"""

import json
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from sqlmodel import Session, select
from ..db import engine, init_db
from .. import models
from ..auth.security import hash_password
from .png_gen import generate_placeholder

UPLOAD_DIR = Path(__file__).parent.parent.parent / "data" / "uploads"
PASSWORD = "Test1234"

# ---------------------------------------------------------------------------
# Colour palettes (full 12-season structure)
# ---------------------------------------------------------------------------

PALETTES = {
    "Warm Autumn": {
        "season": "Autumn",
        "sub_season": "Warm Autumn",
        "description": "Rich, warm, and earthy. Your colouring has a golden warmth that is complemented by deep, saturated autumnal hues.",
        "characteristics": {
            "skin_undertone": "Warm golden",
            "skin_description": "Warm olive-to-golden complexion with a natural radiance",
            "eye_colour": "Dark brown with amber flecks",
            "hair_colour": "Deep brunette with warm chestnut undertones"
        },
        "best_colours": [
            {"name": "Burnt Sienna", "hex": "#C65D3E"},
            {"name": "Warm Terracotta", "hex": "#C4754B"},
            {"name": "Deep Teal", "hex": "#1F6B6B"},
            {"name": "Olive Green", "hex": "#6B7A40"},
            {"name": "Warm Rust", "hex": "#B5512F"},
            {"name": "Saffron Gold", "hex": "#D4A843"},
            {"name": "Rich Burgundy", "hex": "#7A1F2E"},
            {"name": "Forest Green", "hex": "#2D5A3D"},
            {"name": "Warm Coral", "hex": "#D47B6A"},
            {"name": "Deep Mustard", "hex": "#C29B3A"},
            {"name": "Copper Brown", "hex": "#9E5B3C"},
            {"name": "Warm Plum", "hex": "#7A3B5E"}
        ],
        "best_neutrals": [
            {"name": "Warm Camel", "hex": "#C4A672"},
            {"name": "Rich Chocolate", "hex": "#4A2E1F"},
            {"name": "Warm Taupe", "hex": "#8B7D6B"},
            {"name": "Ivory", "hex": "#F5F0E1"},
            {"name": "Bronze", "hex": "#8C6E45"}
        ],
        "avoid_colours": [
            {"name": "Icy Pink", "hex": "#F0C0D0"},
            {"name": "Cool Grey", "hex": "#9CA3AF"},
            {"name": "Bright Fuchsia", "hex": "#E040A0"},
            {"name": "Stark White", "hex": "#FFFFFF"},
            {"name": "Electric Blue", "hex": "#0044FF"}
        ],
        "styling_tips": [
            "Layer warm neutrals like camel and chocolate for a sophisticated autumn look.",
            "Terracotta and olive green are your power colours — wear them for high-impact moments.",
            "Gold jewellery complements your warm undertone perfectly; avoid silver.",
            "Mixing textures (suede, knit, leather) enhances the richness of your palette.",
            "A burnt orange or deep teal scarf can elevate any neutral outfit instantly."
        ]
    },
    "Cool Winter": {
        "season": "Winter",
        "sub_season": "Cool Winter",
        "description": "Bold, crisp, and high-contrast. Your colouring thrives with cool, vivid colours that create strong definition.",
        "characteristics": {
            "skin_undertone": "Cool neutral",
            "skin_description": "Deep complexion with cool blue-brown undertones",
            "eye_colour": "Dark brown, nearly black",
            "hair_colour": "Deep black"
        },
        "best_colours": [
            {"name": "True Navy", "hex": "#1B2A4A"},
            {"name": "Cool Burgundy", "hex": "#6B1D3A"},
            {"name": "Charcoal", "hex": "#36454F"},
            {"name": "Royal Blue", "hex": "#1E3A8A"},
            {"name": "Deep Pine", "hex": "#1B4D3E"},
            {"name": "True Red", "hex": "#B91C1C"},
            {"name": "Cool Plum", "hex": "#5B2C6F"},
            {"name": "Slate Blue", "hex": "#4A5F80"},
            {"name": "Emerald", "hex": "#1F7A50"},
            {"name": "Icy White", "hex": "#F0F4F8"},
            {"name": "Cool Berry", "hex": "#8B1A5A"},
            {"name": "Deep Indigo", "hex": "#2C1B5E"}
        ],
        "best_neutrals": [
            {"name": "True Black", "hex": "#1A1A1A"},
            {"name": "Cool Grey", "hex": "#6B7280"},
            {"name": "Navy", "hex": "#1F2937"},
            {"name": "Pure White", "hex": "#FAFAFA"},
            {"name": "Charcoal", "hex": "#374151"}
        ],
        "avoid_colours": [
            {"name": "Warm Orange", "hex": "#E08040"},
            {"name": "Mustard", "hex": "#C9A02A"},
            {"name": "Warm Camel", "hex": "#C4A672"},
            {"name": "Salmon", "hex": "#E09080"},
            {"name": "Warm Olive", "hex": "#808040"}
        ],
        "styling_tips": [
            "Crisp white shirts and true navy suits are your signature — lean into this contrast.",
            "Silver, platinum, and white gold jewellery suits your cool undertone better than yellow gold.",
            "A true red pocket square or tie creates a powerful focal point.",
            "Black and charcoal are your safest neutrals — they sharpen your natural contrast.",
            "Avoid earthy warm tones; they'll wash you out. Cool-based darks are your strength."
        ]
    },
    "Deep Winter": {
        "season": "Winter",
        "sub_season": "Deep Winter",
        "description": "Dramatic, rich, and intense. Your deep colouring is enhanced by saturated, high-impact colours with cool undertones.",
        "characteristics": {
            "skin_undertone": "Deep cool-neutral",
            "skin_description": "Rich deep complexion with cool-neutral undertones and a luminous quality",
            "eye_colour": "Very dark brown, expressive",
            "hair_colour": "Deep black with blue-black sheen"
        },
        "best_colours": [
            {"name": "Midnight Blue", "hex": "#191970"},
            {"name": "Deep Magenta", "hex": "#8B0050"},
            {"name": "Emerald Green", "hex": "#006B3C"},
            {"name": "True Red", "hex": "#CC0000"},
            {"name": "Royal Purple", "hex": "#4B0082"},
            {"name": "Deep Teal", "hex": "#005F5F"},
            {"name": "Cool Crimson", "hex": "#990033"},
            {"name": "Sapphire", "hex": "#0F52BA"},
            {"name": "Deep Forest", "hex": "#0B3D2C"},
            {"name": "Bright White", "hex": "#F8F8FF"},
            {"name": "Hot Pink", "hex": "#C71585"},
            {"name": "Deep Wine", "hex": "#5C0029"}
        ],
        "best_neutrals": [
            {"name": "True Black", "hex": "#0D0D0D"},
            {"name": "Espresso", "hex": "#3C1414"},
            {"name": "Cool Charcoal", "hex": "#2F2F3A"},
            {"name": "Pure White", "hex": "#FFFFFF"},
            {"name": "Deep Navy", "hex": "#0A1929"}
        ],
        "avoid_colours": [
            {"name": "Peach", "hex": "#FFCBA4"},
            {"name": "Light Khaki", "hex": "#C3B091"},
            {"name": "Warm Beige", "hex": "#D5C4A1"},
            {"name": "Pale Yellow", "hex": "#FFFACD"},
            {"name": "Dusty Rose", "hex": "#C9A0A0"}
        ],
        "styling_tips": [
            "You can wear dramatic colour-blocking — pair deep jewel tones with black for maximum impact.",
            "Both silver and white gold work beautifully; also try bold statement jewellery in rich tones.",
            "Bright white against your skin creates a stunning contrast — embrace it for evening wear.",
            "Deep jewel tones (emerald, sapphire, magenta) are your red-carpet colours.",
            "Avoid muted pastels and warm beiges — they diminish your natural drama."
        ]
    },
}

# ---------------------------------------------------------------------------
# Wardrobe data per user
# ---------------------------------------------------------------------------

SARAH_WARDROBE = [
    {"name": "Tailored Wool Blazer", "category": "outerwear", "color": "navy", "pattern": "solid", "formality": 4, "season": "all", "fabric": "wool", "brand": "Max Mara", "notes": "Structured shoulders, nipped waist. Goes with everything."},
    {"name": "Silk Pussy-Bow Blouse", "category": "top", "color": "ivory", "pattern": "solid", "formality": 4, "season": "all", "fabric": "silk", "brand": "Equipment", "notes": "Statement piece for meetings."},
    {"name": "Cashmere Crew Neck", "category": "top", "color": "camel", "pattern": "solid", "formality": 3, "season": "winter", "fabric": "cashmere", "brand": "Theory", "notes": "Buttery soft, everyday luxury."},
    {"name": "White Cotton Shirt", "category": "top", "color": "white", "pattern": "solid", "formality": 3, "season": "all", "fabric": "cotton", "brand": "COS", "notes": "Oversized fit, relaxed weekend shirt."},
    {"name": "Merino V-Neck", "category": "top", "color": "forest green", "pattern": "solid", "formality": 3, "season": "winter", "fabric": "wool", "brand": "Reiss", "notes": "Rich green, great with gold jewellery."},
    {"name": "Printed Wrap Top", "category": "top", "color": "rust", "pattern": "printed", "formality": 3, "season": "fall", "fabric": "polyester", "brand": "DVF", "notes": "Warm autumnal print, flattering neckline."},
    {"name": "High-Waisted Wool Trousers", "category": "bottom", "color": "charcoal", "pattern": "solid", "formality": 4, "season": "all", "fabric": "wool", "brand": "Arket", "notes": "Wide-leg, extremely polished."},
    {"name": "Straight-Leg Dark Jeans", "category": "bottom", "color": "denim", "pattern": "solid", "formality": 2, "season": "all", "fabric": "denim", "brand": "AGOLDE", "notes": "Dark rinse, smart-casual versatile."},
    {"name": "A-Line Midi Skirt", "category": "bottom", "color": "burgundy", "pattern": "solid", "formality": 4, "season": "fall", "fabric": "wool", "brand": "Hobbs", "notes": "Perfect autumn skirt, knee-length."},
    {"name": "Pleated Wide Trousers", "category": "bottom", "color": "olive", "pattern": "solid", "formality": 3, "season": "spring", "fabric": "cotton", "brand": "Toast", "notes": "Relaxed but put-together."},
    {"name": "Linen Culottes", "category": "bottom", "color": "oatmeal", "pattern": "solid", "formality": 2, "season": "summer", "fabric": "linen", "brand": "COS", "notes": "Breezy summer staple."},
    {"name": "Fitted Sheath Dress", "category": "dress", "color": "burgundy", "pattern": "solid", "formality": 5, "season": "all", "fabric": "wool", "brand": "LK Bennett", "notes": "Boardroom power dress."},
    {"name": "Wrap Midi Dress", "category": "dress", "color": "terracotta", "pattern": "printed", "formality": 3, "season": "spring", "fabric": "silk", "brand": "Reformation", "notes": "Warm print, day-to-evening."},
    {"name": "Camel Wool Coat", "category": "outerwear", "color": "camel", "pattern": "solid", "formality": 4, "season": "winter", "fabric": "wool", "brand": "Max Mara", "notes": "Investment piece, classic silhouette."},
    {"name": "Leather Biker Jacket", "category": "outerwear", "color": "cognac", "pattern": "solid", "formality": 2, "season": "fall", "fabric": "leather", "brand": "AllSaints", "notes": "Warm brown leather, softened with age."},
    {"name": "Trench Coat", "category": "outerwear", "color": "tan", "pattern": "solid", "formality": 3, "season": "spring", "fabric": "cotton", "brand": "Burberry", "notes": "Classic, goes with everything."},
    {"name": "Suede Ankle Boots", "category": "shoes", "color": "brown", "pattern": "solid", "formality": 3, "season": "fall", "fabric": "suede", "brand": "Stuart Weitzman", "notes": "Stacked heel, comfortable all day."},
    {"name": "Pointed Toe Pumps", "category": "shoes", "color": "black", "pattern": "solid", "formality": 5, "season": "all", "fabric": "leather", "brand": "Jimmy Choo", "notes": "3-inch heel, timeless."},
    {"name": "White Leather Trainers", "category": "shoes", "color": "white", "pattern": "solid", "formality": 1, "season": "all", "fabric": "leather", "brand": "Common Projects", "notes": "Minimalist, dress up or down."},
    {"name": "Leopard Print Loafers", "category": "shoes", "color": "brown", "pattern": "printed", "formality": 3, "season": "all", "fabric": "leather", "brand": "J.Crew", "notes": "Statement shoe, neutral enough for daily wear."},
    {"name": "Gold Pendant Necklace", "category": "jewellery", "color": "gold", "pattern": "solid", "formality": 3, "season": "all", "fabric": "other", "brand": "Monica Vinader", "notes": "Everyday layering piece."},
    {"name": "Leather Tote Bag", "category": "bag", "color": "cognac", "pattern": "solid", "formality": 3, "season": "all", "fabric": "leather", "brand": "Polène", "notes": "Work bag, fits laptop."},
    {"name": "Silk Scarf", "category": "accessory", "color": "terracotta", "pattern": "printed", "formality": 3, "season": "all", "fabric": "silk", "brand": "Hermès", "notes": "Warm-toned print, ties beautifully."},
    {"name": "Chunky Gold Bracelet", "category": "jewellery", "color": "gold", "pattern": "solid", "formality": 3, "season": "all", "fabric": "other", "brand": "Missoma", "notes": "Statement wrist piece."},
]

NATE_WARDROBE = [
    {"name": "Navy Two-Button Suit Jacket", "category": "outerwear", "color": "navy", "pattern": "solid", "formality": 5, "season": "all", "fabric": "wool", "brand": "Hugo Boss", "notes": "Slim fit, half-canvassed. Interview-ready."},
    {"name": "Navy Suit Trousers", "category": "bottom", "color": "navy", "pattern": "solid", "formality": 5, "season": "all", "fabric": "wool", "brand": "Hugo Boss", "notes": "Matching suit trousers, tapered leg."},
    {"name": "Charcoal Wool Blazer", "category": "outerwear", "color": "charcoal", "pattern": "solid", "formality": 4, "season": "all", "fabric": "wool", "brand": "SuitSupply", "notes": "Versatile, pairs with jeans or trousers."},
    {"name": "Crisp White Dress Shirt", "category": "top", "color": "white", "pattern": "solid", "formality": 5, "season": "all", "fabric": "cotton", "brand": "Charles Tyrwhitt", "notes": "Non-iron, spread collar. Go-to."},
    {"name": "Light Blue Oxford Shirt", "category": "top", "color": "light blue", "pattern": "solid", "formality": 3, "season": "all", "fabric": "cotton", "brand": "Ralph Lauren", "notes": "Button-down collar, smart-casual staple."},
    {"name": "Fine Gauge Merino Polo", "category": "top", "color": "navy", "pattern": "solid", "formality": 3, "season": "spring", "fabric": "wool", "brand": "Sunspel", "notes": "Elevated casual, fits under a blazer."},
    {"name": "Grey Cashmere Sweater", "category": "top", "color": "grey", "pattern": "solid", "formality": 3, "season": "winter", "fabric": "cashmere", "brand": "N.Peal", "notes": "Classic crew neck, luxurious hand-feel."},
    {"name": "Black Turtleneck", "category": "top", "color": "black", "pattern": "solid", "formality": 3, "season": "winter", "fabric": "wool", "brand": "COS", "notes": "Sleek, modern, great under a blazer."},
    {"name": "Chambray Sport Shirt", "category": "top", "color": "denim", "pattern": "solid", "formality": 2, "season": "summer", "fabric": "cotton", "brand": "J.Crew", "notes": "Relaxed weekend shirt."},
    {"name": "Charcoal Flat-Front Trousers", "category": "bottom", "color": "charcoal", "pattern": "solid", "formality": 4, "season": "all", "fabric": "wool", "brand": "Theory", "notes": "Slim, versatile with any blazer."},
    {"name": "Dark Indigo Jeans", "category": "bottom", "color": "indigo", "pattern": "solid", "formality": 2, "season": "all", "fabric": "denim", "brand": "APC", "notes": "Raw selvedge, dark wash. Dress up or down."},
    {"name": "Stone Chinos", "category": "bottom", "color": "stone", "pattern": "solid", "formality": 2, "season": "spring", "fabric": "cotton", "brand": "Bonobos", "notes": "Slim straight, weekend favourite."},
    {"name": "Tailored Navy Overcoat", "category": "outerwear", "color": "navy", "pattern": "solid", "formality": 5, "season": "winter", "fabric": "wool", "brand": "Crombie", "notes": "Full-length, investment piece."},
    {"name": "Black Leather Jacket", "category": "outerwear", "color": "black", "pattern": "solid", "formality": 2, "season": "fall", "fabric": "leather", "brand": "AllSaints", "notes": "Classic biker, broken-in perfectly."},
    {"name": "Quilted Vest", "category": "outerwear", "color": "charcoal", "pattern": "solid", "formality": 2, "season": "fall", "fabric": "polyester", "brand": "Barbour", "notes": "Layering piece for transitional weather."},
    {"name": "Black Cap-Toe Oxfords", "category": "shoes", "color": "black", "pattern": "solid", "formality": 5, "season": "all", "fabric": "leather", "brand": "Church's", "notes": "The definitive dress shoe."},
    {"name": "Brown Suede Loafers", "category": "shoes", "color": "brown", "pattern": "solid", "formality": 3, "season": "spring", "fabric": "suede", "brand": "Crockett & Jones", "notes": "Unlined, smart-casual bridge."},
    {"name": "White Leather Sneakers", "category": "shoes", "color": "white", "pattern": "solid", "formality": 1, "season": "all", "fabric": "leather", "brand": "Common Projects", "notes": "Minimalist, the weekend shoe."},
    {"name": "Silver Automatic Watch", "category": "accessory", "color": "silver", "pattern": "solid", "formality": 4, "season": "all", "fabric": "other", "brand": "Omega", "notes": "Seamaster, daily wearer."},
    {"name": "Burgundy Silk Tie", "category": "accessory", "color": "burgundy", "pattern": "solid", "formality": 5, "season": "all", "fabric": "silk", "brand": "Drake's", "notes": "Deep cool red, powerful."},
    {"name": "Navy Wool Scarf", "category": "accessory", "color": "navy", "pattern": "solid", "formality": 3, "season": "winter", "fabric": "wool", "brand": "Johnstons of Elgin", "notes": "Cashmere blend, versatile."},
    {"name": "Black Leather Belt", "category": "accessory", "color": "black", "pattern": "solid", "formality": 4, "season": "all", "fabric": "leather", "brand": "Anderson's", "notes": "Classic, matches oxfords."},
    {"name": "Leather Briefcase", "category": "bag", "color": "black", "pattern": "solid", "formality": 4, "season": "all", "fabric": "leather", "brand": "Montblanc", "notes": "Fits 15\" laptop, professional."},
]

DUDUZILE_WARDROBE = [
    {"name": "Structured Black Blazer", "category": "outerwear", "color": "black", "pattern": "solid", "formality": 4, "season": "all", "fabric": "wool", "brand": "The Row", "notes": "Architectural cut, oversized shoulders."},
    {"name": "Silk Charmeuse Blouse", "category": "top", "color": "emerald", "pattern": "solid", "formality": 4, "season": "all", "fabric": "silk", "brand": "Vince", "notes": "Rich jewel tone, draped beautifully."},
    {"name": "Black Cashmere Turtleneck", "category": "top", "color": "black", "pattern": "solid", "formality": 3, "season": "winter", "fabric": "cashmere", "brand": "Totême", "notes": "Minimal, perfect base layer."},
    {"name": "White Asymmetric Shirt", "category": "top", "color": "white", "pattern": "solid", "formality": 3, "season": "all", "fabric": "cotton", "brand": "Acne Studios", "notes": "Sculptural collar, conversation starter."},
    {"name": "Deep Wine Knit Top", "category": "top", "color": "wine", "pattern": "solid", "formality": 3, "season": "winter", "fabric": "wool", "brand": "Joseph", "notes": "Ribbed knit, rich against skin."},
    {"name": "Graphic Print Silk Shirt", "category": "top", "color": "royal blue", "pattern": "geometric", "formality": 3, "season": "spring", "fabric": "silk", "brand": "Equipment", "notes": "Bold geo print, statement piece."},
    {"name": "Black Wide-Leg Trousers", "category": "bottom", "color": "black", "pattern": "solid", "formality": 4, "season": "all", "fabric": "wool", "brand": "The Row", "notes": "High-waisted, dramatic silhouette."},
    {"name": "Tailored Charcoal Trousers", "category": "bottom", "color": "charcoal", "pattern": "solid", "formality": 4, "season": "all", "fabric": "wool", "brand": "Theory", "notes": "Slim cut, versatile base."},
    {"name": "Black Straight Jeans", "category": "bottom", "color": "black", "pattern": "solid", "formality": 2, "season": "all", "fabric": "denim", "brand": "Citizens of Humanity", "notes": "True black wash, elevated casual."},
    {"name": "Ivory Pleated Skirt", "category": "bottom", "color": "ivory", "pattern": "solid", "formality": 4, "season": "spring", "fabric": "polyester", "brand": "Proenza Schouler", "notes": "Midi length, moves beautifully."},
    {"name": "Leather Pencil Skirt", "category": "bottom", "color": "black", "pattern": "solid", "formality": 4, "season": "fall", "fabric": "leather", "brand": "Isabel Marant", "notes": "Edge meets sophistication."},
    {"name": "Column Maxi Dress", "category": "dress", "color": "black", "pattern": "solid", "formality": 5, "season": "all", "fabric": "silk", "brand": "St. John", "notes": "Floor-length, gala-ready."},
    {"name": "Emerald Midi Dress", "category": "dress", "color": "emerald", "pattern": "solid", "formality": 4, "season": "spring", "fabric": "silk", "brand": "Diane von Furstenberg", "notes": "Jewel tone, wrap silhouette."},
    {"name": "Long Black Wool Coat", "category": "outerwear", "color": "black", "pattern": "solid", "formality": 5, "season": "winter", "fabric": "wool", "brand": "Max Mara", "notes": "Floor-skimming, dramatic."},
    {"name": "White Oversized Blazer", "category": "outerwear", "color": "white", "pattern": "solid", "formality": 3, "season": "summer", "fabric": "linen", "brand": "Jacquemus", "notes": "Clean lines, summer statement."},
    {"name": "Puffer Vest", "category": "outerwear", "color": "black", "pattern": "solid", "formality": 1, "season": "fall", "fabric": "polyester", "brand": "Moncler", "notes": "Functional luxury, layering essential."},
    {"name": "Black Pointed Stilettos", "category": "shoes", "color": "black", "pattern": "solid", "formality": 5, "season": "all", "fabric": "leather", "brand": "Manolo Blahnik", "notes": "4-inch heel, evening essential."},
    {"name": "Black Ankle Boots", "category": "shoes", "color": "black", "pattern": "solid", "formality": 3, "season": "fall", "fabric": "leather", "brand": "Acne Studios", "notes": "Block heel, architectural shape."},
    {"name": "Metallic Silver Sandals", "category": "shoes", "color": "silver", "pattern": "solid", "formality": 4, "season": "summer", "fabric": "leather", "brand": "Giuseppe Zanotti", "notes": "Statement evening shoe."},
    {"name": "White Chunky Sneakers", "category": "shoes", "color": "white", "pattern": "solid", "formality": 1, "season": "all", "fabric": "leather", "brand": "Alexander McQueen", "notes": "Platform, modern wardrobe staple."},
    {"name": "Statement Gold Earrings", "category": "jewellery", "color": "gold", "pattern": "solid", "formality": 3, "season": "all", "fabric": "other", "brand": "Alighieri", "notes": "Oversized discs, signature piece."},
    {"name": "Black Structured Tote", "category": "bag", "color": "black", "pattern": "solid", "formality": 4, "season": "all", "fabric": "leather", "brand": "Celine", "notes": "Luggage tote, fits everything."},
    {"name": "Deep Red Clutch", "category": "bag", "color": "crimson", "pattern": "solid", "formality": 5, "season": "all", "fabric": "leather", "brand": "Bottega Veneta", "notes": "Intrecciato weave, evening bag."},
    {"name": "Oversized Sunglasses", "category": "accessory", "color": "black", "pattern": "solid", "formality": 2, "season": "summer", "fabric": "other", "brand": "Celine", "notes": "Cat-eye shape, instant polish."},
]

# ---------------------------------------------------------------------------
# Occasions per user
# ---------------------------------------------------------------------------

def _sarah_occasions():
    now = datetime.utcnow()
    return [
        {"name": "Board Strategy Presentation", "occasion_type": "meeting", "datetime_local": now + timedelta(days=5, hours=9), "end_datetime": now + timedelta(days=5, hours=12), "location": "London", "venue": "Canary Wharf — Level 42 Boardroom", "description": "Quarterly strategy presentation to the executive board. 30 attendees. Must convey authority.", "dress_code": "business_formal", "comfort": "medium", "desired_outcome": "authoritative, composed, respected", "budget": 0, "weather_hint": "Indoor, climate controlled", "importance": 5, "attendees": "CEO, CFO, board members, division heads", "role": "speaker", "status": "upcoming"},
        {"name": "Dinner at The Ivy", "occasion_type": "dinner", "datetime_local": now + timedelta(days=2, hours=19), "end_datetime": now + timedelta(days=2, hours=22), "location": "London", "venue": "The Ivy, Covent Garden", "description": "Celebratory dinner with old university friends. First time seeing them in months.", "dress_code": "smart_casual", "comfort": "maximum", "desired_outcome": "relaxed, chic, effortlessly put-together", "budget": 0, "weather_hint": "Cool evening, short walk from tube", "importance": 3, "attendees": "5 close friends", "role": "guest", "status": "upcoming"},
        {"name": "Client Cocktail Reception", "occasion_type": "party", "datetime_local": now + timedelta(days=12, hours=18), "end_datetime": now + timedelta(days=12, hours=21), "location": "London", "venue": "The Shard — Oblix Bar", "description": "Annual client appreciation evening. Important networking opportunity.", "dress_code": "cocktail", "comfort": "medium", "desired_outcome": "approachable yet impressive, polished", "budget": 200, "weather_hint": "Indoor, rooftop bar", "importance": 4, "attendees": "Clients, partners, senior colleagues (~50)", "role": "host", "status": "upcoming"},
        {"name": "Weekend Art Exhibition", "occasion_type": "other", "datetime_local": now + timedelta(days=21, hours=14), "end_datetime": now + timedelta(days=21, hours=17), "location": "London", "venue": "Saatchi Gallery, Chelsea", "description": "Private viewing of new contemporary African art exhibition. Invited by the curator.", "dress_code": "smart_casual", "comfort": "maximum", "desired_outcome": "creative, cultured, understated", "budget": 0, "weather_hint": "Indoor gallery, spring weather outside", "importance": 2, "attendees": "Art collectors, friends, curator", "role": "guest", "status": "upcoming"},
        {"name": "Mum's Birthday Lunch", "occasion_type": "dinner", "datetime_local": now - timedelta(days=8, hours=-13), "end_datetime": now - timedelta(days=8, hours=-16), "location": "London", "venue": "Sketch, Mayfair", "description": "Surprise birthday lunch organised for mum. Wanted to look special but not overdone.", "dress_code": "smart_casual", "comfort": "maximum", "desired_outcome": "warm, elegant, family-appropriate", "budget": 0, "weather_hint": "Mild, indoor restaurant", "importance": 4, "attendees": "Mum, dad, Nate, extended family (~12)", "role": "host", "status": "past"},
        {"name": "TEDx Speaker Prep", "occasion_type": "conference", "datetime_local": now + timedelta(days=45, hours=10), "end_datetime": now + timedelta(days=45, hours=17), "location": "London", "venue": "Barbican Centre", "description": "Invited to give a 15-minute TEDx talk on leadership in African diaspora business. Massive audience, filmed.", "dress_code": "business_casual", "comfort": "medium", "desired_outcome": "inspiring, credible, memorable", "budget": 500, "weather_hint": "Indoor auditorium", "importance": 5, "attendees": "500+ audience, speakers, organisers", "role": "speaker", "status": "upcoming"},
    ]

def _nate_occasions():
    now = datetime.utcnow()
    return [
        {"name": "Architecture Awards Gala", "occasion_type": "party", "datetime_local": now + timedelta(days=8, hours=19), "end_datetime": now + timedelta(days=8, hours=23), "location": "New York", "venue": "The Met — American Wing", "description": "Black-tie awards ceremony. Firm is nominated for Best Urban Design. Need to look sharp.", "dress_code": "black_tie", "comfort": "medium", "desired_outcome": "commanding, polished, celebratory", "budget": 300, "weather_hint": "Indoor, formal venue", "importance": 5, "attendees": "500+ industry peers, firm partners, press", "role": "guest", "status": "upcoming"},
        {"name": "Client Site Visit", "occasion_type": "meeting", "datetime_local": now + timedelta(days=3, hours=10), "end_datetime": now + timedelta(days=3, hours=15), "location": "New York", "venue": "Hudson Yards Development — 55th Floor", "description": "Walking a major client through the construction progress. Mix of office meetings and on-site walkthrough.", "dress_code": "business_casual", "comfort": "maximum", "desired_outcome": "professional, trustworthy, knowledgeable", "budget": 0, "weather_hint": "Indoor offices + outdoor construction site", "importance": 4, "attendees": "Client team (6), project managers, site foreman", "role": "speaker", "status": "upcoming"},
        {"name": "Jazz Club Night", "occasion_type": "date", "datetime_local": now + timedelta(days=1, hours=20), "end_datetime": now + timedelta(days=1, hours=23, minutes=30), "location": "New York", "venue": "Blue Note Jazz Club, Greenwich Village", "description": "Evening out. Good music, good conversation. Want to look effortlessly cool.", "dress_code": "smart_casual", "comfort": "maximum", "desired_outcome": "relaxed, confident, approachable", "budget": 0, "weather_hint": "Cool evening, walking distance", "importance": 3, "attendees": "2-3 close friends", "role": "guest", "status": "upcoming"},
        {"name": "Charity Fundraiser Run", "occasion_type": "other", "datetime_local": now + timedelta(days=30, hours=8), "end_datetime": now + timedelta(days=30, hours=11), "location": "New York", "venue": "Central Park — Bethesda Terrace", "description": "5K charity run for urban youth architecture programme. Post-run brunch with donors.", "dress_code": "casual", "comfort": "maximum", "desired_outcome": "energetic, approachable, community-minded", "budget": 0, "weather_hint": "Outdoor, spring morning, 15°C", "importance": 2, "attendees": "50 runners, sponsors, donors", "role": "host", "status": "upcoming"},
        {"name": "Sarah's Birthday Surprise", "occasion_type": "dinner", "datetime_local": now - timedelta(days=15, hours=-19), "end_datetime": now - timedelta(days=15, hours=-22), "location": "New York", "venue": "Le Bernardin", "description": "Flew to London for Sarah's surprise birthday dinner. Wanted to look great for the occasion.", "dress_code": "semi_formal", "comfort": "high", "desired_outcome": "celebratory, warm, well-dressed", "budget": 0, "weather_hint": "Indoor, upscale restaurant", "importance": 4, "attendees": "Family and close friends (~15)", "role": "guest", "status": "past"},
    ]

def _duduzile_occasions():
    now = datetime.utcnow()
    return [
        {"name": "Product Launch Keynote", "occasion_type": "conference", "datetime_local": now + timedelta(days=4, hours=9), "end_datetime": now + timedelta(days=4, hours=17), "location": "San Francisco", "venue": "Moscone Center — Hall D", "description": "Launching our new platform to 2,000+ attendees. Keynote is 45 minutes. Media coverage expected.", "dress_code": "business_casual", "comfort": "medium", "desired_outcome": "visionary, bold, memorable", "budget": 400, "weather_hint": "Indoor auditorium, fog outside", "importance": 5, "attendees": "2,000+ tech industry, press, investors", "role": "speaker", "status": "upcoming"},
        {"name": "VC Investor Dinner", "occasion_type": "dinner", "datetime_local": now + timedelta(days=10, hours=19), "end_datetime": now + timedelta(days=10, hours=22), "location": "San Francisco", "venue": "Quince — Jackson Square", "description": "Private dinner with Series C investors. Need to balance authority with approachability.", "dress_code": "smart_casual", "comfort": "medium", "desired_outcome": "commanding, trustworthy, sophisticated", "budget": 0, "weather_hint": "Indoor, fine dining", "importance": 5, "attendees": "3 VCs, co-founder, board advisor", "role": "host", "status": "upcoming"},
        {"name": "Gallery Opening — Own Collection", "occasion_type": "party", "datetime_local": now + timedelta(days=18, hours=18), "end_datetime": now + timedelta(days=18, hours=22), "location": "San Francisco", "venue": "Minnesota Street Project", "description": "Opening night for my personal photography exhibition. A passion project coming to life.", "dress_code": "cocktail", "comfort": "maximum", "desired_outcome": "artistic, bold, authentic", "budget": 300, "weather_hint": "Indoor gallery, cool SF evening", "importance": 4, "attendees": "100+ collectors, friends, press, art community", "role": "host", "status": "upcoming"},
        {"name": "Team Offsite Hike & Dinner", "occasion_type": "other", "datetime_local": now + timedelta(days=25, hours=10), "end_datetime": now + timedelta(days=25, hours=20), "location": "Muir Woods, CA", "venue": "Muir Woods → Cavallo Point Lodge", "description": "Company leadership offsite — morning hike through redwoods, afternoon strategy session, team dinner.", "dress_code": "casual", "comfort": "maximum", "desired_outcome": "approachable, energetic, natural leader", "budget": 0, "weather_hint": "Outdoor hike (cool, misty) → indoor dinner", "importance": 3, "attendees": "Leadership team (12)", "role": "host", "status": "upcoming"},
        {"name": "TechCrunch Disrupt Panel", "occasion_type": "conference", "datetime_local": now - timedelta(days=5, hours=-14), "end_datetime": now - timedelta(days=5, hours=-16), "location": "San Francisco", "venue": "Moscone Center — Stage 2", "description": "Panelist on 'Building for the Next Billion Users.' Went well — made great connections.", "dress_code": "business_casual", "comfort": "medium", "desired_outcome": "expert, visionary, relatable", "budget": 0, "weather_hint": "Indoor, stage lighting", "importance": 4, "attendees": "800+ audience, 4 panelists, moderator", "role": "speaker", "status": "past"},
        {"name": "Best Friend's Wedding", "occasion_type": "wedding", "datetime_local": now + timedelta(days=60, hours=15), "end_datetime": now + timedelta(days=60, hours=23), "location": "Napa Valley, CA", "venue": "Solage Resort — Outdoor Pavilion", "description": "Lebo's wedding! Maid of honour duties. Outdoor ceremony in the vineyard, indoor reception.", "dress_code": "semi_formal", "comfort": "high", "desired_outcome": "elegant, joyful, photogenic, supportive", "budget": 500, "weather_hint": "Outdoor vineyard ceremony (warm), indoor reception (AC)", "importance": 5, "attendees": "150 guests", "role": "host", "status": "upcoming"},
    ]

# ---------------------------------------------------------------------------
# Playbook templates (rich new structure)
# ---------------------------------------------------------------------------

def _build_playbook(user, occasion, items):
    """Build a realistic playbook JSON structure matching the new rich format."""
    formality = {"casual": 1, "smart_casual": 2, "business_casual": 3, "semi_formal": 4, "business_formal": 5, "cocktail": 4, "black_tie": 5, "white_tie": 5}
    target_f = formality.get(occasion.get("dress_code", "smart_casual"), 3)
    gender = user["gender"]

    # Pick 3 outfits from appropriate items
    suited = [i for i in items if i["formality"] >= target_f - 1]
    if len(suited) < 6:
        suited = items[:]
    import random
    random.seed(hash(occasion["name"]))
    random.shuffle(suited)

    def _make_outfit(title, selected, reason):
        return {
            "title": title,
            "items": [{"id": idx + 1, "name": s["name"], "category": s["category"]} for idx, s in enumerate(selected[:4])],
            "reasoning": reason,
            "styling_notes": f"Keep the silhouette clean. This combination works because the formality levels align well with {occasion['dress_code']} expectations.",
            "accessories": "Complete with polished shoes and one statement accessory to add personality.",
            "risk_flags": []
        }

    outfits = [
        _make_outfit("The Power Move", suited[:4], f"Ideal for {occasion['occasion_type']}. Projects confidence and aligns with the {occasion['dress_code']} dress code at {occasion.get('venue', 'the venue')}."),
        _make_outfit("The Understated Choice", suited[4:8] if len(suited) >= 8 else suited[2:6], f"A more understated option that still reads as polished. Perfect if you want to let your presence — not your outfit — lead."),
        _make_outfit("The Bold Option", suited[8:12] if len(suited) >= 12 else suited[1:5], f"This leans slightly more expressive. Great for making a memorable impression at {occasion['name']}."),
    ]

    upgrade_suggestions = [
        {"item": "A quality leather belt in a matching tone", "why": "Ties shoes and bag together for a cohesive look", "priority": "medium"},
        {"item": f"A statement {'scarf' if gender == 'female' else 'pocket square'} in a complementary tone", "why": "Adds personality and colour without overdoing it", "priority": "low"},
    ]

    importance = occasion.get("importance", 3)
    prep = {
        "week_before": ["Confirm outfit is clean, pressed, and ready", "Check shoes — polish or clean as needed", "Book any grooming appointments (haircut, nails)"] if importance >= 4 else [],
        "three_days_before": ["Try on full outfit head-to-toe and check in mirror", "Iron or steam any items that need freshening", "Confirm accessories and bag are ready"],
        "day_before": ["Lay out complete outfit including undergarments", "Charge devices, prepare bag with essentials", "Get a good night's sleep — aim for 7+ hours", f"Review notes for {occasion['name']}" if occasion.get("role") in ("speaker", "host") else "Review the event details and agenda"],
        "morning_of": ["Shower and complete grooming routine", "Get dressed with time to spare — no rushing", "Final mirror check: fit, lint, accessories", "Eat a proper meal — you'll perform better"],
        "just_before": ["Deep breath — you're prepared and you look great", "Quick posture check: shoulders back, chin level", f"Arrive at {occasion.get('venue', 'the venue')} 10-15 minutes early"],
        "pack_list": ["Phone + charger", "Breath mints", "Business cards" if occasion.get("role") in ("speaker", "host", "interviewee") else "Wallet/purse", "A light layer in case it's cold"],
    }

    presence = {
        "mindset": [
            f"You belong at {occasion['name']}. You were invited for a reason.",
            "Focus on being genuinely curious about others — it takes the pressure off you.",
            "Remember: confidence isn't about being the loudest. It's about being settled in yourself.",
            f"Your role as {occasion.get('role', 'guest')} means people will look to you — own that quietly.",
        ],
        "body_language": [
            "Stand tall with relaxed shoulders — avoid crossing arms.",
            "Make warm eye contact when speaking and listening.",
            "Smile genuinely when greeting people — it's disarming.",
            "Keep your hands visible and gestures open — it builds trust.",
        ],
        "conversation": {
            "openers": [
                f"'What brings you to {occasion['name']}?'",
                "'I love this venue — have you been here before?'",
                "'How do you know [the host]?'" if occasion.get("role") != "host" else "'So glad you could make it — what are you most looking forward to?'",
            ],
            "topics_to_discuss": [
                "Current projects or passions — people light up when asked about what excites them",
                f"The venue and setting at {occasion.get('venue', 'the venue')}",
                "Shared connections or experiences",
                "Recent travel, books, or cultural events",
            ],
            "graceful_exits": [
                "'It's been great chatting — I should go say hello to a few more people. Let's connect soon.'",
                "'Excuse me, I'm going to grab a drink — can I get you anything?'",
                "'I'd love to continue this conversation — can I get your card?'",
            ]
        },
        "pep_talk": f"You've prepared. Your outfit is dialled in. You know your stuff. Walk into {occasion.get('venue', 'that room')} like you've been there a hundred times before — because someone like you? You belong in every room you choose to enter.",
    }

    beauty = {
        "skin_prep": [
            "Cleanse and moisturise — keep skin hydrated and fresh.",
            "Apply SPF if there's any sun exposure.",
            f"{'Light, natural makeup — let your skin breathe. A great lip colour can anchor the whole look.' if gender == 'female' else 'Apply lip balm for a clean, polished look.'}",
        ],
        "hair": f"{'A polished blow-out or sleek updo would complement this look beautifully.' if gender == 'female' else 'Clean, well-groomed hair. A fresh lineup or trim a few days before makes a difference.'}",
        "fragrance": f"Something warm and refined — not overpowering. Apply to pulse points 30 minutes before arriving.",
        "grooming_notes": [
            "Check nails — clean, filed, and presentable.",
            "Teeth — brush and use mouthwash before heading out.",
            f"{'Brows — groom lightly for a polished frame.' if gender == 'female' else 'Trim any stray facial hair.'}",
            "Final lint-roll your outfit before walking out the door.",
        ]
    }

    return {
        "look": json.dumps({"outfits": outfits, "upgrade_suggestions": upgrade_suggestions}),
        "prep": json.dumps(prep),
        "presence": json.dumps(presence),
        "beauty": json.dumps(beauty),
    }


# ---------------------------------------------------------------------------
# Main seeder
# ---------------------------------------------------------------------------

def _save_placeholder_image(user_id: int, colour: str, index: int) -> str:
    """Generate and save a placeholder PNG, return relative path."""
    subdir = UPLOAD_DIR / "wardrobe" / str(user_id)
    subdir.mkdir(parents=True, exist_ok=True)
    filename = f"seed_{index}_{uuid.uuid4().hex[:8]}.png"
    filepath = subdir / filename
    png_bytes = generate_placeholder(colour)
    with open(filepath, "wb") as f:
        f.write(png_bytes)
    return f"wardrobe/{user_id}/{filename}"


def seed_demo_data():
    """
    Create 3 demo users with full wardrobe, colour analysis, occasions, and playbooks.
    Only runs if no users exist in the database.
    Returns True if data was seeded, False if skipped.
    """
    init_db()

    with Session(engine) as session:
        existing = session.exec(select(models.User)).first()
        if existing:
            return False  # DB already has data

        print("\n[SEED] Seeding Orive demo data...")

        users_data = [
            {
                "email": "sarah@orive.com",
                "full_name": "Sarah Belete",
                "gender": "female",
                "date_of_birth": "1980-06-15",
                "postcode": "SW1A 1AA",
                "height_cm": 170,
                "weight_kg": 62,
                "body_type": "rectangle",
                "style_go_tos": "Tailored blazers, high-waisted trousers, silk blouses, structured bags. I gravitate towards clean lines with one statement piece.",
                "style_no_goes": "Neon colours, overly casual athleisure, logo-heavy pieces, fast fashion.",
                "style_cant_wear": "Very high heels for long events (3 inches max). Nothing too tight around the waist after a big meal.",
                "colour_season": "Warm Autumn",
                "wardrobe": SARAH_WARDROBE,
                "occasions_fn": _sarah_occasions,
            },
            {
                "email": "nate@orive.com",
                "full_name": "Nate Belete",
                "gender": "male",
                "date_of_birth": "1978-11-03",
                "postcode": "10012",
                "height_cm": 185,
                "weight_kg": 82,
                "body_type": "rectangle",
                "style_go_tos": "Well-fitted suits, crisp white shirts, quality leather shoes. Classic with a modern edge — I like looking put-together without trying too hard.",
                "style_no_goes": "Graphic tees at work, distressed anything, overly trendy pieces that won't age well.",
                "style_cant_wear": "Slim-fit trousers that are too tight in the thigh. Prefer a tapered or straight leg.",
                "colour_season": "Cool Winter",
                "wardrobe": NATE_WARDROBE,
                "occasions_fn": _nate_occasions,
            },
            {
                "email": "duduzile@orive.com",
                "full_name": "Duduzile Jele",
                "gender": "female",
                "date_of_birth": "1981-03-22",
                "postcode": "94102",
                "height_cm": 175,
                "weight_kg": 65,
                "body_type": "rectangle",
                "style_go_tos": "Architectural silhouettes, bold jewel tones, statement earrings, mixing high and emerging designers. Fashion is self-expression.",
                "style_no_goes": "Pastels, anything too sweet or frilly, conventional 'tech bro' casual, excessive patterns.",
                "style_cant_wear": "Very fitted pencil skirts below the knee — I need to be able to stride. No itchy fabrics near the neck.",
                "colour_season": "Deep Winter",
                "wardrobe": DUDUZILE_WARDROBE,
                "occasions_fn": _duduzile_occasions,
            },
        ]

        for ud in users_data:
            # Create user
            palette = PALETTES[ud["colour_season"]]
            user = models.User(
                email=ud["email"],
                hashed_password=hash_password(PASSWORD),
                full_name=ud["full_name"],
                is_active=True,
                onboarding_complete=True,
                gender=ud["gender"],
                date_of_birth=ud["date_of_birth"],
                postcode=ud["postcode"],
                height_cm=ud["height_cm"],
                weight_kg=ud["weight_kg"],
                body_type=ud["body_type"],
                style_go_tos=ud["style_go_tos"],
                style_no_goes=ud["style_no_goes"],
                style_cant_wear=ud["style_cant_wear"],
                colour_season=ud["colour_season"],
                colour_palette_json=json.dumps(palette),
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            print(f"  [OK] Created user: {user.full_name} ({user.email})")

            # Create wardrobe items with placeholder images
            item_records = []
            for idx, item_data in enumerate(ud["wardrobe"]):
                img_path = _save_placeholder_image(user.id, item_data["color"], idx)
                db_item = models.ClosetItem(
                    user_id=user.id,
                    name=item_data["name"],
                    category=item_data["category"],
                    color=item_data["color"],
                    pattern=item_data["pattern"],
                    formality=item_data["formality"],
                    season=item_data["season"],
                    fabric=item_data["fabric"],
                    brand=item_data.get("brand"),
                    notes=item_data.get("notes", ""),
                    image_path=img_path,
                    ai_tagged=True,
                )
                session.add(db_item)
                item_records.append(item_data)
            session.commit()
            print(f"    - {len(item_records)} wardrobe items")

            # Create occasions
            occasions = ud["occasions_fn"]()
            occasion_records = []
            for occ_data in occasions:
                db_occ = models.Occasion(
                    user_id=user.id,
                    name=occ_data["name"],
                    occasion_type=occ_data["occasion_type"],
                    datetime_local=occ_data["datetime_local"],
                    end_datetime=occ_data.get("end_datetime"),
                    location=occ_data.get("location", ""),
                    venue=occ_data.get("venue", ""),
                    description=occ_data.get("description", ""),
                    dress_code=occ_data.get("dress_code", ""),
                    comfort=occ_data.get("comfort", "medium"),
                    desired_outcome=occ_data.get("desired_outcome", "confident"),
                    budget=occ_data.get("budget", 0),
                    weather_hint=occ_data.get("weather_hint", ""),
                    importance=occ_data.get("importance", 3),
                    attendees=occ_data.get("attendees", ""),
                    role=occ_data.get("role", "guest"),
                    status=occ_data.get("status", "upcoming"),
                )
                session.add(db_occ)
                session.commit()
                session.refresh(db_occ)
                occasion_records.append((db_occ, occ_data))
            print(f"    - {len(occasion_records)} occasions")

            # Generate playbooks for the top 3 upcoming occasions by importance
            upcoming = [(rec, data) for rec, data in occasion_records if data["status"] == "upcoming"]
            upcoming.sort(key=lambda x: x[1]["importance"], reverse=True)
            playbook_count = 0
            for db_occ, occ_data in upcoming[:3]:
                pb_data = _build_playbook(ud, occ_data, ud["wardrobe"])
                playbook = models.Playbook(
                    occasion_id=db_occ.id,
                    look_json=pb_data["look"],
                    beauty_json=pb_data["beauty"],
                    prep_json=pb_data["prep"],
                    presence_json=pb_data["presence"],
                )
                session.add(playbook)
                db_occ.playbook_generated = True
                session.add(db_occ)
                playbook_count += 1
            session.commit()
            print(f"    - {playbook_count} playbooks generated")

        print("\n[SEED] Demo data ready! Log in with any of these accounts:")
        print("    sarah@orive.com / Test1234  (London - Warm Autumn)")
        print("    nate@orive.com  / Test1234  (New York - Cool Winter)")
        print("    duduzile@orive.com / Test1234  (San Francisco - Deep Winter)")
        print()
        return True


def seed_all(clear_existing=False, session: Session = None):
    """Legacy compat — calls the new seeder."""
    return seed_demo_data()
