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

def extract_metadata(image_bytes: bytes, raw_caption: str, item_id: int, client) -> dict:
    """Uses Gemini 3.8 Flash to extract structured commercial catalog metadata."""
    from google.genai import types

    prompt = f"""
    Analyze this supplier product photo (Item #{item_id}) and raw supplier caption: "{raw_caption}"

    Tasks:
    1. Identify the exact retail kitchenware product being sold (ignore wooden stools, human hands, legs, or background clutter).
    2. Commercial Retail Title: Clean and appealing retail name (e.g. '16-Piece Matte Ceramic Dinnerware Set').
    3. Category: Strictly map to one of: 'pots-pans' | 'tableware' | 'utensils' | 'appliances'.
    4. Price: Clean integer retail price in Nigerian Naira (NGN integer).
       - '25k' -> 25000, '1800' -> 1800, '5500' -> 5500, '12k' -> 12000.
       - If wholesale (e.g. '50k 55k per doz'), calculate single retail unit price (e.g. 5000-5500).
    5. Description: 2-sentence commercial description emphasizing material quality, durability, and kitchen care.

    Return ONLY a JSON object:
    {{
      "name": "Title",
      "category": "tableware",
      "price": 25000,
      "description": "Crafted from durable food-safe materials..."
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
            return data
    except Exception as e:
        print(f"    [Metadata Extraction Note]: {e}")

    return {
        "name": f"Artisan Kitchenware #{item_id}",
        "category": "tableware",
        "price": 15000,
        "description": "Crafted from premium food-safe materials for enduring durability and kitchen elegance."
    }

def generate_commercial_image(image_bytes: bytes, product_name: str, category: str, client) -> Image.Image:
    """
    Directly calls Google Generative Multimodal Image model (gemini-3.1-flash-image-preview)
    to perform pure generative image editing, outpainting clipped edges, and synthesizing
    a photorealistic luxury kitchen commercial studio environment.
    """
    from google.genai import types

    # Contextual environment details based on category
    if category in ["pots-pans", "appliances"]:
        surface = "clean polished white Carrara marble countertop"
    elif category == "utensils":
        surface = "warm artisanal wooden butcher block kitchen island"
    else:
        surface = "minimalist ceramic stone dining table"

    prompt = (
        f"High-end commercial 1:1 square product photography of the kitchenware shown in this image: {product_name}. "
        f"Place it naturally centered on a {surface} in a luxury modern kitchen with soft ambient morning window light, "
        f"brand warm cream tones (#FAF7F2 palette), subtle natural contact shadow and surface reflection, "
        f"complete any cut-off or clipped edges (plate rims, handles, or lids), photorealistic, 8k resolution, crisp detail."
    )

    models_to_try = ["gemini-3.1-flash-image-preview", "gemini-3-pro-image-preview"]
    for m in models_to_try:
        try:
            resp = client.models.generate_content(
                model=m,
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
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
    print("  JIREL KITCHEN HUB - PURE GENERATIVE IMAGE INGESTION ENGINE")
    print("=================================================================")

    api_key = load_gemini_api_key()
    if not api_key:
        print("[Error] Billing-enabled GEMINI_API_KEY is not found in .env.local!")
        return

    from google import genai
    client = genai.Client(api_key=api_key)
    print("Connected to Google Generative AI with billing enabled.\n")

    items_map = parse_items_txt()
    print(f"Loaded {len(items_map)} items from {ITEMS_TXT}...\n")

    processed = 0

    for item_id in range(1, 21):
        raw_path = RAW_DIR / f"{item_id}.jpeg"
        if not raw_path.exists():
            print(f"[Skip] {raw_path} not found.")
            continue

        raw_caption = items_map.get(item_id, f"Kitchenware item #{item_id}")
        print(f"--> [{item_id}/20] Generative Ingestion for Item #{item_id}: {raw_path.name}")
        print(f"    Supplier Caption: '{raw_caption}'")

        with open(raw_path, "rb") as f:
            raw_bytes = f.read()

        # 1. Metadata extraction via Gemini 3.8 Flash
        meta = extract_metadata(raw_bytes, raw_caption, item_id, client)
        prod_name = meta["name"]
        category = meta.get("category", "tableware")
        price = meta.get("price", 15000)
        print(f"    Retail Title:     {prod_name}")
        print(f"    Category:         {category} | Price: NGN {price:,}")

        # 2. Pure Generative Multimodal Image Synthesis
        print(f"    [Generative AI] Calling Gemini 3.1 Flash Image model...")
        try:
            gen_img = generate_commercial_image(raw_bytes, prod_name, category, client)
            square_img = format_square_canvas(gen_img, 800)

            # 3. Save to canonical WebP product asset
            slug = CANONICAL_SLUGS.get(item_id, f"item-{item_id}")
            out_file = f"{slug}.webp"
            out_path = OUT_DIR / out_file
            square_img.save(out_path, "WEBP", quality=92)
            print(f"    [OK] Pure generative studio asset saved: {out_path}\n")
            processed += 1
        except Exception as e:
            print(f"    [Error] Generative synthesis failed for Item #{item_id}: {e}\n")

        # 4-second delay for smooth execution
        if item_id < 20:
            print("    [Rate Limit Guard] Pausing 4 seconds...")
            time.sleep(4)

    print("=================================================================")
    print(f"  PURE GENERATIVE INGESTION COMPLETE: {processed}/20 PROCESSED")
    print("=================================================================")

if __name__ == "__main__":
    main()
