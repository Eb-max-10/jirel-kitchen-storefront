import os
import sys
import re
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
    Intelligent fallback parser for supplier captions when GEMINI_API_KEY is not configured.
    Handles '12k' -> 12000, '22k' -> 22000, '8500' -> 8500, variant counts, and category matching.
    """
    caption_lower = raw_caption.lower()
    
    # 1. Price extraction
    price = 15000
    k_match = re.search(r'(\d+(?:\.\d+)?)\s*k\b', caption_lower)
    if k_match:
        price = int(float(k_match.group(1)) * 1000)
    else:
        num_match = re.search(r'\b(\d{4,6})\b', caption_lower)
        if num_match:
            price = int(num_match.group(1))

    # 2. Category mapping
    category = "tableware"
    if any(w in caption_lower for w in ["pot", "pan", "skillet", "cookware"]):
        category = "pots-pans"
    elif any(w in caption_lower for w in ["knife", "knives", "cleaver", "blade"]):
        category = "knives"
    elif any(w in caption_lower for w in ["spoon", "spatula", "whisk", "utensil", "tongs", "turner"]):
        category = "utensils"
    elif any(w in caption_lower for w in ["bake", "cake", "tray", "sheet", "oven", "pan"]) and "wooden tray" not in caption_lower:
        category = "baking"
    elif any(w in caption_lower for w in ["blender", "kettle", "cooker", "appliance", "fryer"]):
        category = "appliances"
    elif any(w in caption_lower for w in ["dish", "tray", "plate", "bowl", "cup", "saucer", "dinner", "tea"]):
        category = "tableware"

    # 3. Clean retail title
    cleaned_caption = re.sub(r'\b\d+(?:\.\d+)?k\b', '', raw_caption, flags=re.IGNORECASE)
    cleaned_caption = re.sub(r'\b\d{4,6}\b', '', cleaned_caption)
    cleaned_caption = re.sub(r'DZ\d+\s*\d*', '', cleaned_caption, flags=re.IGNORECASE)
    cleaned_caption = re.sub(r'\s+', ' ', cleaned_caption).strip(' -:')
    
    words = [w.capitalize() for w in cleaned_caption.split() if w]
    name = " ".join(words) if words else "Premium Kitchenware"
    if len(name) < 4:
        name = "Artisan Kitchenware Set"

    description = (
        f"Crafted for daily culinary elegance, this {name.lower()} combines durable materials "
        f"with timeless tabletop aesthetics suitable for modern Nigerian kitchens."
    )

    return {
        "name": name,
        "category": category,
        "price": price,
        "description": description,
        "box_2d": [80, 80, 920, 920]
    }

def analyze_raw_item(image_path: Path, raw_caption: str) -> dict:
    """Uses multimodal vision (gemini-2.5-flash) to extract metadata and target product bounding box."""
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
        Analyze this supplier product image and caption: "{raw_caption}"
        
        Tasks:
        1. Identify the EXACT target product being sold (ignore wooden stools, human hands, legs, or store background shelves).
        2. Extract normalized bounding box coordinates for the PRODUCT ONLY: [ymin, xmin, ymax, xmax] on a 0-1000 scale.
        3. Generate a clean commercial retail title, category, description, and price in Nigerian Naira (NGN integer).
           - Note: If price is wholesale (e.g., 'per doz'), calculate a sensible 30% marked-up single unit retail price or bundle price.
           - Clean numbers: '12k' -> 12000, '22k' -> 22000, '8500' -> 8500.

        Return ONLY a JSON object:
        {{
          "name": "Title",
          "category": "pots-pans | tableware | utensils | appliances | baking | knives",
          "price": 12000,
          "description": "Short 2-sentence description",
          "box_2d": [ymin, xmin, ymax, xmax]
        }}
        """

        response = None
        # Try best supported multimodal models in order
        for model_name in ["gemini-3.5-flash", "gemini-3.8-flash", "gemini-2.5-flash", "gemini-flash-latest"]:
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
                # If specific model is deprecated or busy, try next candidate
                continue

        if not response or not response.text:
            raise RuntimeError("All Gemini model candidates failed to return response")

        data = json.loads(response.text)
        if "box_2d" not in data or len(data["box_2d"]) != 4:
            data["box_2d"] = [80, 80, 920, 920]
        return data
    except Exception as e:
        print(f"  [Gemini Notice] Vision API notice ({e}). Falling back to heuristic analyzer.")
        return fallback_heuristic_analyzer(image_path, raw_caption)

def process_product(image_path: Path, raw_caption: str) -> dict:
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
    
    # Save optimized WebP
    raw_slug = metadata["name"].lower().replace(" ", "-")
    clean_slug = re.sub(r'[^a-z0-9\-]', '', raw_slug).strip('-')[:30].strip('-')
    if not clean_slug:
        clean_slug = f"item-{Path(image_path).stem}"
        
    out_img_name = f"{clean_slug}.webp"
    out_path = OUT_DIR / out_img_name
    canvas.convert("RGB").save(out_path, "WEBP", quality=85)
    
    metadata["slug"] = clean_slug
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
        # Skip if slug already exists in products.ts
        if f"slug: '{slug}'" in content or f'slug: "{slug}"' in content:
            print(f"  [Skip] Product slug '{slug}' already present in src/data/products.ts")
            continue

        prod_id = f"ingest-{slug}"
        cat_id = p.get("category", "tableware")
        # Ensure valid category id
        valid_cats = ["pots-pans", "knives", "utensils", "tableware", "baking", "appliances"]
        if cat_id not in valid_cats:
            cat_id = "tableware"

        base_price = int(p.get("price", 15000))
        name = p.get("name", "Artisan Cookware").replace("'", "\\'")
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
    rating: 4.8,
    ratingCount: 16,
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
    print("  JIREL HITCHEN HUB - INVENTORY INGESTION ENGINE")
    print("=================================================================")
    
    inventory_file = RAW_DIR / "inventory.json"
    if not inventory_file.exists():
        print(f"[Error] Inventory input file not found: {inventory_file}")
        return

    with open(inventory_file, "r", encoding="utf-8") as f:
        items = json.load(f)

    print(f"Found {len(items)} items in {inventory_file} to process...\n")
    processed_products = []

    for item in items:
        file_name = item.get("file")
        caption = item.get("caption", "")
        img_path = RAW_DIR / file_name

        if not img_path.exists():
            print(f"[Warning] Image file not found: {img_path}. Skipping.")
            continue

        print(f"--> Processing: {file_name} ('{caption}')")
        try:
            prod_meta = process_product(img_path, caption)
            processed_products.append(prod_meta)
            print(f"    Retail Name: {prod_meta['name']}")
            print(f"    Category:    {prod_meta['category']}")
            print(f"    Price (NGN): NGN {prod_meta['price']:,}")
            print(f"    Asset:       {prod_meta['imageUrl']}\n")
        except Exception as e:
            print(f"[Error] Failed processing {file_name}: {e}\n")

    if processed_products:
        print("Synchronizing catalog data...")
        append_to_products_ts(processed_products)

    print("\n=================================================================")
    print("  INGESTION BATCH COMPLETE")
    print("=================================================================")

if __name__ == "__main__":
    main()
