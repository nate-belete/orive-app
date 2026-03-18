"""
Pure-Python PNG generator for placeholder wardrobe images.
No external dependencies required — uses only stdlib (struct, zlib).
"""

import struct
import zlib

# Common colour name -> RGB mapping for wardrobe items
COLOUR_RGB = {
    "black": (30, 30, 30),
    "white": (245, 245, 245),
    "off-white": (250, 245, 235),
    "cream": (255, 253, 240),
    "ivory": (255, 255, 240),
    "navy": (25, 35, 65),
    "blue": (60, 90, 160),
    "light blue": (135, 175, 220),
    "sky blue": (135, 200, 240),
    "powder blue": (176, 210, 230),
    "cobalt": (0, 71, 171),
    "royal blue": (30, 60, 170),
    "red": (175, 40, 40),
    "burgundy": (100, 20, 30),
    "wine": (110, 30, 45),
    "oxblood": (75, 15, 25),
    "crimson": (155, 30, 40),
    "green": (60, 120, 70),
    "olive": (105, 115, 60),
    "forest green": (35, 75, 40),
    "sage": (160, 175, 145),
    "emerald": (30, 130, 75),
    "khaki": (185, 175, 140),
    "brown": (110, 70, 45),
    "tan": (195, 170, 130),
    "camel": (190, 160, 110),
    "cognac": (155, 85, 40),
    "chocolate": (80, 45, 25),
    "taupe": (150, 135, 120),
    "beige": (210, 195, 170),
    "gray": (140, 140, 140),
    "grey": (140, 140, 140),
    "charcoal": (55, 55, 60),
    "light grey": (195, 195, 195),
    "silver": (190, 190, 195),
    "pink": (220, 150, 160),
    "blush": (225, 185, 180),
    "coral": (220, 120, 100),
    "rust": (170, 75, 40),
    "terracotta": (180, 100, 60),
    "orange": (220, 130, 50),
    "burnt orange": (185, 95, 40),
    "yellow": (230, 195, 60),
    "mustard": (195, 165, 50),
    "gold": (195, 165, 75),
    "purple": (100, 55, 120),
    "plum": (105, 50, 80),
    "lavender": (180, 165, 210),
    "lilac": (195, 175, 215),
    "mauve": (175, 130, 155),
    "teal": (55, 120, 120),
    "denim": (85, 105, 140),
    "indigo": (50, 40, 100),
    "mint": (170, 220, 195),
    "peach": (240, 195, 165),
    "stone": (175, 165, 155),
    "oatmeal": (210, 200, 180),
    "heather grey": (165, 165, 170),
}


def colour_to_rgb(colour_name: str) -> tuple:
    """Convert a colour name to RGB tuple. Falls back to a warm grey."""
    name = colour_name.lower().strip()
    if name in COLOUR_RGB:
        return COLOUR_RGB[name]
    for key, val in COLOUR_RGB.items():
        if key in name or name in key:
            return val
    return (170, 160, 150)


def create_solid_png(width: int, height: int, r: int, g: int, b: int) -> bytes:
    """Create a solid-colour PNG image as raw bytes. Pure Python, no deps."""
    raw_data = b""
    row = bytes([r, g, b]) * width
    for _ in range(height):
        raw_data += b"\x00" + row  # filter byte 0 (None) + pixel data

    compressed = zlib.compress(raw_data, 9)

    def chunk(chunk_type: bytes, data: bytes) -> bytes:
        c = chunk_type + data
        crc = struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)
        return struct.pack(">I", len(data)) + c + crc

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", compressed)
    png += chunk(b"IEND", b"")
    return png


def generate_placeholder(colour_name: str, width: int = 400, height: int = 533) -> bytes:
    """Generate a 3:4 aspect ratio placeholder PNG for a given colour name."""
    r, g, b = colour_to_rgb(colour_name)
    return create_solid_png(width, height, r, g, b)
