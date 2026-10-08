import os
import sys
import re
import time
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
from rembg import new_session, remove

# Configure robust console encoding on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Setup Directories
RAW_DIR = Path("raw-inventory")
OUT_DIR = Path("public/images/products")
BG_DIR = Path("public/images/backgrounds")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Curated Backdrops
BACKDROPS = {
    "marble": BG_DIR / "countertop-marble.jpg",
    "wood": BG_DIR / "countertop-wood.jpg",
    "ceramic": BG_DIR / "table-ceramic.jpg",
}

# Known slug mapping from src/data/products.ts to ensure 100% storefront continuity
EXISTING_SLUGS = {
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

def select_backdrop_path(name: str, category: str, caption: str) -> Path:
    """
    Selects the photorealistic contextual kitchen studio backdrop based on product type:
    - Utensils / cutting boards / wooden trays / flatware -> Warm wooden butcher block
    - Pots & pans / appliances / stainless steel thermal bottles -> Carrara marble countertop
    - Dinnerware / plates / cups / saucers / glassware -> Neutral linen dining table
    """
    text = f"{name} {caption}".lower()
    
    # 1. Wooden items, cutting boards, trays, cutlery / flatware -> wood countertop
    if any(k in text for k in ["wood", "wooden", "tray", "flatware", "cutlery", "spoon", "knife", "utensil", "board"]):
        return BACKDROPS["wood"]
    
    # 2. Pots & pans, appliances, thermal stainless steel flasks / bottles / tumblers -> marble countertop
    if category in ["pots-pans", "appliances"] or any(k in text for k in ["pot", "pan", "cookware", "kettle", "appliance", "flask", "tumbler", "bottle", "thermal", "insulated"]):
        return BACKDROPS["marble"]
    
    # 3. Dinnerware, plates, bowls, cups, mugs, glassware -> ceramic linen dining table
    return BACKDROPS["ceramic"]

def generate_grounding_shadows(prod_width: int, prod_height: int, pos_x: int, base_y: int) -> Image.Image:
    """
    Generates realistic multi-stage dual-layer contact and ambient grounding shadows:
    - Layer 1 (Ambient): Wide, diffuse, soft oval shadow spreading gently beneath the item
    - Layer 2 (Contact): Dense, tight, dark oval shadow hugging the immediate base contact seam
    """
    shadow_canvas = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    
    # 1. Ambient shadow (diffuse & soft)
    ambient_w = max(50, int(prod_width * 0.95))
    ambient_h = max(24, int(prod_width * 0.16))
    amb_img = Image.new("RGBA", (ambient_w + 80, ambient_h + 80), (0, 0, 0, 0))
    amb_draw = ImageDraw.Draw(amb_img)
    amb_draw.ellipse([40, 40, 40 + ambient_w, 40 + ambient_h], fill=(20, 18, 15, 85))
    amb_blurred = amb_img.filter(ImageFilter.GaussianBlur(radius=18))
    
    amb_px = int(pos_x + (prod_width / 2) - (amb_img.width / 2))
    amb_py = int(base_y - 22)
    shadow_canvas.paste(amb_blurred, (amb_px, amb_py), mask=amb_blurred)
    
    # 2. Contact shadow (dense & dark right at grounding plane)
    contact_w = max(40, int(prod_width * 0.82))
    contact_h = max(10, int(prod_width * 0.07))
    con_img = Image.new("RGBA", (contact_w + 40, contact_h + 40), (0, 0, 0, 0))
    con_draw = ImageDraw.Draw(con_img)
    con_draw.ellipse([20, 20, 20 + contact_w, 20 + contact_h], fill=(10, 8, 8, 180))
    con_blurred = con_img.filter(ImageFilter.GaussianBlur(radius=5))
    
    con_px = int(pos_x + (prod_width / 2) - (con_img.width / 2))
    con_py = int(base_y - (con_img.height / 2) + 2)
    shadow_canvas.paste(con_blurred, (con_px, con_py), mask=con_blurred)
    
    return shadow_canvas

def analyze_raw_item_with_gemini(image_path: Path, raw_caption: str) -> dict:
    """Uses Gemini Vision to identify the target product bounding box ignoring background noise."""
    api_key = load_gemini_api_key()
    if not api_key:
        print(f"  [Notice] GEMINI_API_KEY not found in env. Using heuristic box.")
        return {"box_2d": [50, 50, 950, 950]}

    try:
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=api_key)
        with open(image_path, "rb") as f:
            image_bytes = f.read()

        prompt = f"""
        Analyze this supplier product photo and caption: "{raw_caption}"

        Task:
        1. Identify the EXACT target kitchenware product being sold.
        2. Strictly IGNORE wooden stools, human fingers, hands, legs, floor tiles, market stalls, stands, and background shelves.
        3. Extract normalized bounding box coordinates for the PRODUCT ONLY: [ymin, xmin, ymax, xmax] on a 0-1000 scale.
           The ymax coordinate must be the true bottom edge of the kitchenware product itself.

        Return ONLY a JSON object:
        {{
          "box_2d": [ymin, xmin, ymax, xmax]
        }}
        """

        response = None
        for model_name in ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"]:
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
            except Exception:
                time.sleep(1)
                continue

        if not response or not response.text:
            return {"box_2d": [50, 50, 950, 950]}

        data = json.loads(response.text)
        if isinstance(data, list) and len(data) > 0:
            data = data[0]

        if "box_2d" not in data or len(data["box_2d"]) != 4:
            data["box_2d"] = [50, 50, 950, 950]

        return data
    except Exception as e:
        print(f"  [Vision Notice] Gemini detection notice: {e}. Using safe bounds.")
        return {"box_2d": [50, 50, 950, 950]}

def process_product_grounded(image_path: Path, raw_caption: str, item_id: int, session) -> str:
    """
    Executes the upgraded grounding pipeline:
    1. Gemini Vision bounding box pre-crop.
    2. ISNet general-use edge segmentation.
    3. Tight alpha bounding crop.
    4. Proportional scaling to 68-72% frame with natural tabletop grounding.
    5. Photorealistic dual-stage grounding contact & ambient shadows.
    6. Contextual studio backdrop composite.
    """
    print(f"  [1/5] Detecting product boundary with Gemini Vision...")
    vision_meta = analyze_raw_item_with_gemini(image_path, raw_caption)
    ymin, xmin, ymax, xmax = vision_meta.get("box_2d", [50, 50, 950, 950])
    
    # Pre-crop strictly with 4% padding margin
    raw_img = Image.open(image_path).convert("RGBA")
    w, h = raw_img.size
    pad_y = int((ymax - ymin) * 0.04)
    pad_x = int((xmax - xmin) * 0.04)
    crop_box = (
        max(0, int((xmin - pad_x) * w / 1000)),
        max(0, int((ymin - pad_y) * h / 1000)),
        min(w, int((xmax + pad_x) * w / 1000)),
        min(h, int((ymax + pad_y) * h / 1000)),
    )
    cropped_target = raw_img.crop(crop_box)
    
    print(f"  [2/5] Segmenting product with ISNet-General-Use...")
    isolated = remove(cropped_target, session=session)
    
    # Crop to non-empty alpha bbox
    bbox = isolated.getbbox()
    if bbox:
        isolated = isolated.crop(bbox)
        
    # Scale to 68-72% of 800x800 frame (~540px max dimension, max height 575px)
    iw, ih = isolated.size
    max_target = 540
    scale = max_target / max(iw, ih)
    if int(ih * scale) > 575:
        scale = 575 / ih
        
    new_w = max(10, int(iw * scale))
    new_h = max(10, int(ih * scale))
    scaled_prod = isolated.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Ground resting line on studio tabletop surface
    base_y = 675
    pos_x = (800 - new_w) // 2
    pos_y = base_y - new_h
    
    print(f"  [3/5] Generating multi-stage realistic contact & ambient shadows...")
    shadow_layer = generate_grounding_shadows(new_w, new_h, pos_x, base_y)
    
    # Determine contextual studio backdrop
    backdrop_path = select_backdrop_path(raw_caption, "tableware", raw_caption)
    print(f"  [4/5] Compositing onto studio backdrop: {backdrop_path.name}...")
    bg_img = Image.open(backdrop_path).convert("RGBA")
    
    # Composite: Background -> Shadow -> Product
    final_canvas = bg_img.copy()
    final_canvas.paste(shadow_layer, (0, 0), mask=shadow_layer)
    final_canvas.paste(scaled_prod, (pos_x, pos_y), mask=scaled_prod)
    
    # Save optimized WebP
    slug = EXISTING_SLUGS.get(item_id, f"item-{item_id}")
    out_filename = f"{slug}.webp"
    out_path = OUT_DIR / out_filename
    final_canvas.convert("RGB").save(out_path, "WEBP", quality=90)
    print(f"  [5/5] [OK] Saved retail-grounded asset: {out_path}\n")
    return out_filename

def main():
    print("=================================================================")
    print("  JIREL KITCHEN HUB - GROUNDED CONTEXTUAL STUDIO INGESTION ENGINE")
    print("=================================================================")
    
    inventory_file = RAW_DIR / "inventory.json"
    if not inventory_file.exists():
        print(f"[Error] Inventory file {inventory_file} not found!")
        return

    with open(inventory_file, "r", encoding="utf-8") as f:
        items = json.load(f)

    print(f"Loading SOTA ISNet segmentation session...")
    isnet_session = new_session("isnet-general-use")
    print("ISNet session ready.\n")

    print(f"Processing {len(items)} catalog products with realistic depth & backdrops...\n")
    processed_count = 0

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
            out_file = process_product_grounded(img_path, caption, item_id, isnet_session)
            processed_count += 1
        except Exception as e:
            print(f"  [Error] Failed processing Item #{item_id} ({file_name}): {e}\n")

        # 4-second delay between items for AI Studio free-tier rate limits
        if idx < len(items) - 1:
            print("    [Rate Limit Guard] Pausing 4 seconds for AI Studio free tier...")
            time.sleep(4)

    print("=================================================================")
    print(f"  GROUNDED INGESTION COMPLETE: {processed_count}/{len(items)} ASSETS RENDERED")
    print("=================================================================")

if __name__ == "__main__":
    main()
