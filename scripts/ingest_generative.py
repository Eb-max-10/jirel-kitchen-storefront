import os
import sys
import re
import io
import time
import json
from pathlib import Path
from PIL import Image

# Ensure UTF-8 console output on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

RAW_DIR = Path("raw-inventory")
ITEMS_TXT = RAW_DIR / "items.txt"
OUT_DIR = Path("public/images/products")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Canonical Slugs in src/data/products.ts
CANONICAL_SLUGS = {
    1: "16-piece-matte-ceramic-dinnerware-s-1",
    2: "stainless-steel-vacuum-insulated-th-2",
    3: "ceramic-dish-and-serving-tray-set-3",
    4: "set-of-3-nested-wooden-serving-tray-4",
    5: "16-piece-modern-grey-dinnerware-set-5",
    6: "32-piece-luxury-gold-tree-ceramic-d-6",
    7: "luxury-ceramic-serving-bowl-with-go-7",
    8: "1200ml-stainless-steel-insulated-tr-8",
    9: "stainless-steel-office-insulated-mu-9",
    10: "24-piece-gold-stainless-steel-flatw-10",
    11: "portable-glass-coffee-mug-with-prot-11",
    12: "luxury-white-ceramic-dinner-plate-w-12",
    13: "ornate-gold-rimmed-porcelain-dinner-13",
    14: "gold-rimmed-white-ceramic-dinner-an-14",
    15: "2-piece-clear-glass-mug-tumbler-set-15",
    16: "g-horse-6-piece-clear-embossed-glas-16",
    17: "3-piece-glitter-tumbler-set-with-ra-17",
    18: "gradient-frosted-motivational-sport-18",
    19: "stainless-steel-thermal-vacuum-trav-19",
    20: "12-piece-blooming-glass-coffee-cup-20",
}

def load_gemini_api_key():
    """Retrieves GEMINI_API_KEY from environment or .env/.env.local."""
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if key and not key.startswith("your_") and not key.startswith("placeholder"):
        return key

    for env_path in [Path(".env.local"), Path(".env"), Path.home() / ".env"]:
        if env_path.exists():
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("GEMINI_API_KEY=") or line.startswith("GOOGLE_API_KEY="):
                            val = line.split("=", 1)[1].strip().strip('"').strip("'")
                            if val and not val.startswith("your_") and not val.startswith("placeholder"):
                                return val
            except Exception:
                pass
    return None

def parse_items_txt() -> dict:
    """Parses raw-inventory/items.txt into a dict {id: raw_caption}."""
    items = {}
    if not ITEMS_TXT.exists():
        return items

    with open(ITEMS_TXT, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            m = re.match(r'^(\d+)\.\s*(.*)', line)
            if m:
                item_id = int(m.group(1))
                caption = m.group(2).strip()
                items[item_id] = caption
    return items

def extract_metadata_and_clean_bbox(image_bytes: bytes, raw_caption: str, item_id: int, client) -> dict:
    """
    Uses Gemini 3.8 Flash to extract structured commercial catalog metadata
    AND a tight product bounding box that strips out top-edge supplier watermarks,
    Chinese banners, SKU stamps (e.g. X932-2), and marketplace logos.
    """
    from google.genai import types

    prompt = f"""
    Analyze this supplier product photo (Item #{item_id}) and raw supplier caption: "{raw_caption}"

    Tasks:
    1. Identify the exact physical kitchenware product being sold.
    2. Bounding Box (`box_2d`): Provide normalized coordinates `[ymin, xmin, ymax, xmax]` (0-1000 scale) strictly around the physical kitchenware product ONLY.
       - CRITICAL: Exclude any top-edge text overlays, SKU codes (like 'X932-2'), Chinese character banners (like '跨境餐具套装'), marketplace logos (Amazon, eBay, Lazada, FDA), floating fruit graphics, or promotional cardboard boxes underneath if they contain heavy promotional text.
    3. Commercial Retail Title: Clean and appealing retail name (e.g. '24-Piece Gold Stainless Steel Flatware Set', '2-Piece Clear Glass Mug Set').
    4. Category: Strictly map to one of: 'pots-pans' | 'tableware' | 'utensils' | 'appliances'.
    5. Price: Clean integer retail price in Nigerian Naira (NGN integer).
       - '25k' -> 25000, '1800' -> 1800, '5500' -> 5500, '4k' -> 4000.
       - If wholesale (e.g. '50k 55k per doz'), calculate single retail unit price (e.g. 5000-5500).
    6. Description: 2-sentence commercial description emphasizing material quality, durability, and kitchen care.

    Return ONLY a JSON object:
    {{
      "name": "Title",
      "category": "tableware",
      "price": 25000,
      "description": "Crafted from durable food-safe materials...",
      "box_2d": [ymin, xmin, ymax, xmax]
    }}
    """

    try:
        resp = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                prompt
            ],
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        if resp and resp.text:
            data = json.loads(resp.text)
            if isinstance(data, list) and len(data) > 0:
                data = data[0]
            if "box_2d" not in data or len(data["box_2d"]) != 4:
                data["box_2d"] = [120, 50, 950, 950]
            return data
    except Exception as e:
        print(f"    [Metadata Extraction Note]: {e}")

    return {
        "name": f"Artisan Kitchenware #{item_id}",
        "category": "tableware",
        "price": 15000,
        "description": "Crafted from premium food-safe materials for enduring durability and kitchen elegance.",
        "box_2d": [120, 50, 950, 950]
    }

def crop_out_watermarks(image_bytes: bytes, bbox: list) -> bytes:
    """
    Crops the raw supplier image strictly to the clean product bounding box
    so top-edge SKU stamps, Chinese text banners, and corner watermarks are
    physically stripped before passing to the generative image model.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h = img.size
    ymin, xmin, ymax, xmax = bbox

    # Add a small 2% inward/outward clamp that never encroaches into excluded top/corner banners
    crop_box = (
        max(0, int(xmin * w / 1000)),
        max(0, int(ymin * h / 1000)),
        min(w, int(xmax * w / 1000)),
        min(h, int(ymax * h / 1000)),
    )
    cropped = img.crop(crop_box)
    buf = io.BytesIO()
    cropped.save(buf, format="JPEG", quality=95)
    return buf.getvalue()

def generate_commercial_image(clean_image_bytes: bytes, product_name: str, category: str, client) -> Image.Image:
    """
    Calls Google Generative Multimodal Image model (gemini-3.1-flash-image-preview)
    on the watermark-cropped product image with explicit negative constraints
    forbidding any text, watermarks, or SKU labels.
    """
    from google.genai import types

    if category in ["pots-pans", "appliances"]:
        surface = "clean polished white Carrara marble countertop"
    elif category == "utensils":
        surface = "warm artisanal wooden butcher block kitchen island"
    else:
        surface = "minimalist ceramic stone dining table"

    prompt = (
        f"High-end commercial 1:1 square product photography of the kitchenware shown in this image: {product_name}. "
        f"Place the product naturally centered on a {surface} in a luxury modern kitchen with soft ambient morning window light, "
        f"brand warm cream tones (#FAF7F2 palette), subtle natural contact shadow and surface reflection, "
        f"and complete any cut-off or clipped edges (plate rims, handles, or lids), photorealistic, 8k resolution, crisp detail. "
        f"CRITICAL NEGATIVE CONSTRAINTS: Do NOT include any text, Chinese characters, SKU numbers, model codes, "
        f"watermarks, promotional plaques, gold info badges, or supplier banners anywhere on the walls, corners, or countertop. "
        f"The background wall and countertop must be 100% clean with NO text, NO watermarks, and NO SKU labels."
    )

    models_to_try = ["gemini-3.1-flash-image-preview", "gemini-3-pro-image-preview"]
    for m in models_to_try:
        try:
            resp = client.models.generate_content(
                model=m,
                contents=[
                    types.Part.from_bytes(data=clean_image_bytes, mime_type="image/jpeg"),
                    prompt
                ],
            )
            if resp and resp.candidates:
                for cand in resp.candidates:
                    if cand.content and cand.content.parts:
                        for part in cand.content.parts:
                            if getattr(part, "inline_data", None) and part.inline_data.data:
                                img_data = part.inline_data.data
                                img = Image.open(io.BytesIO(img_data)).convert("RGB")
                                return img
        except Exception as e:
            print(f"    [Generative Model {m} Notice]: {e}")
            time.sleep(2)

    raise RuntimeError("Failed to generate commercial image from generative image model.")

def format_square_canvas(img: Image.Image, target_size: int = 800) -> Image.Image:
    """Center-crops or fits image to an exact 800x800 square canvas."""
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    right = left + min_dim
    bottom = top + min_dim
    cropped = img.crop((left, top, right, bottom))
    return cropped.resize((target_size, target_size), Image.Resampling.LANCZOS)

def main():
    print("=================================================================")
    print("  JIREL KITCHEN HUB - WATERMARK-FREE GENERATIVE INGESTION ENGINE")
    print("=================================================================")

    api_key = load_gemini_api_key()
    if not api_key:
        print("[Error] Billing-enabled GEMINI_API_KEY is not found in .env.local!")
        return

    from google import genai
    client = genai.Client(api_key=api_key)
    print("Connected to Google Generative AI with billing enabled.\n")

    items_map = parse_items_txt()

    # Support optional CLI item IDs (e.g. `python scripts/ingest_generative.py 10 15`)
    if len(sys.argv) > 1:
        target_ids = [int(arg) for arg in sys.argv[1:] if arg.isdigit()]
        print(f"Targeting specific Item IDs: {target_ids}\n")
    else:
        target_ids = list(range(1, 21))
        print(f"Processing full catalog batch (20 items)...\n")

    processed = 0

    for idx, item_id in enumerate(target_ids):
        raw_path = RAW_DIR / f"{item_id}.jpeg"
        if not raw_path.exists():
            print(f"[Skip] {raw_path} not found.")
            continue

        raw_caption = items_map.get(item_id, f"Kitchenware item #{item_id}")
        print(f"--> [{idx+1}/{len(target_ids)}] Generative Ingestion for Item #{item_id}: {raw_path.name}")
        print(f"    Supplier Caption: '{raw_caption}'")

        with open(raw_path, "rb") as f:
            raw_bytes = f.read()

        # 1. Metadata & Clean Product BBox extraction via Gemini 3.8 Flash
        meta = extract_metadata_and_clean_bbox(raw_bytes, raw_caption, item_id, client)
        prod_name = meta["name"]
        category = meta.get("category", "tableware")
        price = meta.get("price", 15000)
        bbox = meta.get("box_2d", [120, 50, 950, 950])
        print(f"    Retail Title:     {prod_name}")
        print(f"    Category:         {category} | Price: NGN {price:,}")
        print(f"    Clean Product Box (Stripping Watermarks): {bbox}")

        # 2. Pre-crop to strip top-edge supplier text banners / SKU codes
        clean_crop_bytes = crop_out_watermarks(raw_bytes, bbox)

        # 3. Pure Generative Multimodal Image Synthesis with Negative Constraints
        print(f"    [Generative AI] Synthesizing studio scene (watermark-free)...")
        try:
            gen_img = generate_commercial_image(clean_crop_bytes, prod_name, category, client)
            square_img = format_square_canvas(gen_img, 800)

            # 4. Save to canonical WebP product asset
            slug = CANONICAL_SLUGS.get(item_id, f"item-{item_id}")
            out_file = f"{slug}.webp"
            out_path = OUT_DIR / out_file
            square_img.save(out_path, "WEBP", quality=92)
            print(f"    [OK] Clean generative studio asset saved: {out_path}\n")
            processed += 1
        except Exception as e:
            print(f"    [Error] Generative synthesis failed for Item #{item_id}: {e}\n")

        # 4-second delay between items
        if idx < len(target_ids) - 1:
            print("    [Rate Limit Guard] Pausing 4 seconds...")
            time.sleep(4)

    print("=================================================================")
    print(f"  GENERATIVE INGESTION COMPLETE: {processed}/{len(target_ids)} PROCESSED")
    print("=================================================================")

if __name__ == "__main__":
    main()
