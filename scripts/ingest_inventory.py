import os
import sys
import re
import time
import json
from pathlib import Path
from PIL import Image
from rembg import remove

# Configure robust console encoding on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Setup Directories
RAW_DIR = Path("raw-inventory")
OUT_DIR = Path("public/images/products")
OUT_DIR.mkdir(parents=True, exist_ok=True)

CANVAS_COLOR = (250, 247, 242, 255)  # Brand #FAF7F2

def load_gemini_api_key():
    """Finds GEMINI_API_KEY from environment or .env/.env.local files."""
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

def fallback_heuristic_analyzer(image_path: Path, raw_caption: str) -> dict:
    """
    Intelligent fallback parser for supplier captions when GEMINI_API_KEY is not configured
    or when API is temporarily unavailable.
    """
    caption_lower = raw_caption.lower()
    
    # 1. Price extraction
    price = 15000
    k_match = re.search(r'(\d+(?:\.\d+)?)\s*k\b', caption_lower)
    if k_match:
        price = int(float(k_match.group(1)) * 1000)
    else:
        num_match = re.search(r'\b(\d{3,6})\b', caption_lower)
        if num_match:
            price = int(num_match.group(1))

    # 2. Category mapping (strict schema: pots-pans, tableware, utensils, appliances)
    category = "tableware"
    if any(w in caption_lower for w in ["pot", "pan", "skillet", "cookware", "casserole", "baking", "sheet", "tray", "dish"]) and "wooden tray" not in caption_lower:
        if any(w in caption_lower for w in ["pot", "pan", "skillet", "cookware"]):
            category = "pots-pans"
        elif any(w in caption_lower for w in ["dish", "tray"]):
            category = "tableware"
    elif any(w in caption_lower for w in ["knife", "knives", "cleaver", "blade", "spoon", "spatula", "whisk", "utensil", "tongs"]):
        category = "utensils"
    elif any(w in caption_lower for w in ["blender", "kettle", "cooker", "appliance", "fryer"]):
        category = "appliances"
    elif any(w in caption_lower for w in ["plate", "bowl", "cup", "saucer", "dinner", "tea", "tumbler", "bottle", "mug", "tableware", "tray", "flatware", "cutlery"]):
        category = "tableware"

    # 3. Clean retail title
    cleaned_caption = re.sub(r'\b\d+(?:\.\d+)?k\b', '', raw_caption, flags=re.IGNORECASE)
    cleaned_caption = re.sub(r'\b\d{3,6}\b', '', cleaned_caption)
    cleaned_caption = re.sub(r'DZ\d+\s*\d*', '', cleaned_caption, flags=re.IGNORECASE)
    cleaned_caption = re.sub(r'\s+', ' ', cleaned_caption).strip(' -:')
    
    words = [w.capitalize() for w in cleaned_caption.split() if w]
    name = " ".join(words) if words else f"Kitchenware Item {image_path.stem}"
    if len(name) < 4:
        name = f"Artisan Tableware {image_path.stem}"

    description = (
        f"Crafted from premium food-grade materials for enduring durability and daily elegance. "
        f"Hand wash with mild soap and dry with a soft cloth to preserve its pristine surface finish."
    )

    return {
        "name": name,
        "category": category,
        "price": price,
        "description": description,
        "box_2d": [60, 60, 940, 940]
    }

def analyze_raw_item(image_path: Path, raw_caption: str) -> dict:
    """Uses multimodal vision (Gemini) to extract metadata and target product bounding box."""
    api_key = load_gemini_api_key()
    
    if not api_key:
        print(f"  [Notice] GEMINI_API_KEY not found in env. Using intelligent heuristic analyzer.")
        return fallback_heuristic_analyzer(image_path, raw_caption)

    try:
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=api_key)
        with open(image_path, "rb") as f:
            image_bytes = f.read()

        prompt = f"""
        Analyze this Nigerian supplier product photo and raw caption: "{raw_caption}"

        Instructions:
        1. Target Product Only: Identify the exact kitchenware item being sold. Ignore human hands, feet, legs, wooden stools, tiled floors, market stalls, or background shelves.
        2. Bounding Box: Extract normalized coordinates for the product only as [ymin, xmin, ymax, xmax] on a 0-1000 scale.
        3. Commercial Retail Title: Generate a concise, appealing commercial retail title (e.g., '24-Piece Gold Cutlery Set with Stand', '16-Piece Ceramic Dinner Set').
        4. Category: Map strictly to ONE of these 4 schema categories: 'pots-pans' | 'tableware' | 'utensils' | 'appliances'.
           (Dinner sets, plates, bowls, cups, mugs, water bottles, tumblers, and trays map to 'tableware').
        5. Price: Calculate a clean integer retail price in Nigerian Naira (NGN integer).
           - '25k' -> 25000, '1800' -> 1800, '12k' -> 12000, '8500' -> 8500.
           - If wholesale (e.g. '50k 55k per doz'), compute a single unit price with ~30% retail markup or a sensible single retail price (e.g. 5000 to 5500 each).
        6. Description: Provide exactly a 2-sentence commercial description emphasizing material, durability, and kitchen care.

        Return ONLY a JSON object:
        {{
          "name": "Title",
          "category": "tableware",
          "price": 25000,
          "description": "Crafted from durable food-safe materials...",
          "box_2d": [ymin, xmin, ymax, xmax]
        }}
        """

        response = None
        # Cascade through available Gemini models
        for model_name in ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"]:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=[
                        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                        prompt
                    ],
                    config=types.GenerateContentConfig(response_mime_type="application/json")
                )
                if response and response.text:
                    break
            except Exception as model_err:
                time.sleep(1)
                continue

        if not response or not response.text:
            raise RuntimeError("Gemini models unavailable, falling back to heuristic")

        data = json.loads(response.text)
        if "box_2d" not in data or len(data["box_2d"]) != 4:
            data["box_2d"] = [60, 60, 940, 940]

        # Enforce valid schema category
        valid_cats = ["pots-pans", "tableware", "utensils", "appliances"]
        if data.get("category") not in valid_cats:
            cat = str(data.get("category", "")).lower()
            if "pot" in cat or "pan" in cat:
                data["category"] = "pots-pans"
            elif "knife" in cat or "utensil" in cat or "spoon" in cat:
                data["category"] = "utensils"
            elif "appliance" in cat or "cooker" in cat or "kettle" in cat:
                data["category"] = "appliances"
            else:
                data["category"] = "tableware"

        return data
    except Exception as e:
        print(f"  [Gemini Notice] Vision API notice ({e}). Falling back to heuristic analyzer.")
        return fallback_heuristic_analyzer(image_path, raw_caption)

def process_product(image_path: Path, raw_caption: str, item_id: int) -> dict:
    metadata = analyze_raw_item(image_path, raw_caption)
    
    img = Image.open(image_path).convert("RGBA")
    w, h = img.size
    ymin, xmin, ymax, xmax = metadata["box_2d"]
    
    # 1. Expand crop slightly (5% margin) to prevent clipping product edges
    pad_y = int((ymax - ymin) * 0.05)
    pad_x = int((xmax - xmin) * 0.05)
    
    crop_box = (
        max(0, int((xmin - pad_x) * w / 1000)),
        max(0, int((ymin - pad_y) * h / 1000)),
        min(w, int((xmax + pad_x) * w / 1000)),
        min(h, int((ymax + pad_y) * h / 1000)),
    )
    cropped_target = img.crop(crop_box)
    
    # 2. Segment cropped target
    isolated = remove(cropped_target)
    
    # 3. Composite onto brand #FAF7F2 canvas (800x800)
    canvas = Image.new("RGBA", (800, 800), CANVAS_COLOR)
    isolated.thumbnail((680, 680), Image.Resampling.LANCZOS)
    
    pos_x = (800 - isolated.width) // 2
    pos_y = (800 - isolated.height) // 2
    canvas.paste(isolated, (pos_x, pos_y), mask=isolated)
    
    # Save optimized WebP with clean unique slug
    raw_slug = metadata["name"].lower().replace(" ", "-")
    clean_slug = re.sub(r'[^a-z0-9\-]', '', raw_slug).strip('-')[:35].strip('-')
    if not clean_slug:
        clean_slug = f"item-{item_id}"
    else:
        clean_slug = f"{clean_slug}-{item_id}"
        
    out_img_name = f"{clean_slug}.webp"
    out_path = OUT_DIR / out_img_name
    canvas.convert("RGB").save(out_path, "WEBP", quality=85)
    
    metadata["slug"] = clean_slug
    metadata["itemId"] = item_id
    metadata["imageUrl"] = f"/images/products/{out_img_name}"
    print(f"  [OK] Processed studio image saved to: {out_path}")
    return metadata

def append_to_products_ts(product_records: list):
    """Programmatically updates src/data/products.ts with new ingested catalog items."""
    products_file = Path("src/data/products.ts")
    if not products_file.exists():
        print("  [Error] src/data/products.ts does not exist!")
        return

    content = products_file.read_text(encoding="utf-8")

    # Match the products array end bracket `];`
    pattern = re.compile(r'(\nexport const products:\s*Product\[\]\s*=\s*\[)(.*?)(\n\];)', re.DOTALL)
    match = pattern.search(content)
    if not match:
        print("  [Error] Could not locate 'export const products: Product[] = [...];' in products.ts")
        return

    existing_array_body = match.group(2)
    new_entries = []

    for idx, p in enumerate(product_records):
        slug = p["slug"]
        prod_id = f"item-{p.get('itemId', idx+1)}"

        # If slug or id already present, skip duplicate
        if f"slug: '{slug}'" in content or f'id: \'{prod_id}\'' in content:
            print(f"  [Skip] Product '{slug}' already present in src/data/products.ts")
            continue

        cat_id = p.get("category", "tableware")
        valid_cats = ["pots-pans", "tableware", "utensils", "appliances"]
        if cat_id not in valid_cats:
            cat_id = "tableware"

        base_price = int(p.get("price", 15000))
        name = p.get("name", "Artisan Kitchenware").replace("'", "\\'")
        desc = p.get("description", "").replace("'", "\\'")
        img_url = p["imageUrl"]

        entry_ts = f"""  {{
    id: '{prod_id}',
    name: '{name}',
    slug: '{slug}',
    description:
      '{desc}',
    categoryId: '{cat_id}',
    basePrice: {base_price},
    isFeatured: false,
    isBestSeller: false,
    rating: 4.9,
    ratingCount: 18,
    variants: [
      {{ id: 'var-{slug}-1', name: 'Standard Studio', colorHex: '#FAF7F2' }},
    ],
    images: [
      {{
        id: 'img-{slug}-1',
        variantId: 'var-{slug}-1',
        url: '{img_url}',
        alt: '{name} presented on brand studio background',
        isPrimary: true,
      }},
    ],
  }},"""
        new_entries.append(entry_ts)

    if not new_entries:
        print("  [Catalog] No new products to append (all already present).")
        return

    # Splice new entries into the products array
    updated_body = existing_array_body.rstrip() + "\n" + "\n".join(new_entries) + "\n"
    new_content = content[:match.start(2)] + updated_body + content[match.end(2):]
    products_file.write_text(new_content, encoding="utf-8")
    print(f"  [OK] Successfully appended {len(new_entries)} new products to src/data/products.ts")

def main():
    print("=================================================================")
    print("  JIREL HITCHEN HUB - 20 RAW INVENTORY INGESTION ENGINE")
    print("=================================================================")
    
    inventory_file = RAW_DIR / "inventory.json"
    if not inventory_file.exists():
        print(f"[Error] Inventory input file not found: {inventory_file}")
        return

    with open(inventory_file, "r", encoding="utf-8") as f:
        items = json.load(f)

    print(f"Found {len(items)} items in {inventory_file} to process...\n")
    processed_products = []

    for idx, item in enumerate(items):
        item_id = item.get("id", idx + 1)
        file_name = item.get("file")
        caption = item.get("caption", "")
        img_path = RAW_DIR / file_name

        if not img_path.exists():
            print(f"[Warning] Image file not found: {img_path}. Skipping.")
            continue

        print(f"--> [{idx+1}/{len(items)}] Processing Item #{item_id}: {file_name}")
        print(f"    Raw Caption: '{caption}'")
        try:
            prod_meta = process_product(img_path, caption, item_id)
            processed_products.append(prod_meta)
            print(f"    Retail Name: {prod_meta['name']}")
            print(f"    Category:    {prod_meta['category']}")
            print(f"    Price (NGN): NGN {prod_meta['price']:,}")
            print(f"    Asset:       {prod_meta['imageUrl']}\n")
        except Exception as e:
            print(f"[Error] Failed processing {file_name}: {e}\n")

        # 4-second delay between items to stay well within Gemini free tier limits
        if idx < len(items) - 1:
            print("    [Rate Limit Guard] Pausing 4 seconds for AI Studio free tier...")
            time.sleep(4)

    if processed_products:
        print("Synchronizing catalog data to src/data/products.ts...")
        append_to_products_ts(processed_products)

    print("\n=================================================================")
    print(f"  INGESTION COMPLETE: {len(processed_products)} ITEMS PROCESSED")
    print("=================================================================")

if __name__ == "__main__":
    main()
