#!/usr/bin/env python3
"""
Jirel Kitchen Hub - Launch Campaign Asset Generator
===================================================
Generates a complete multi-format campaign asset package for our 3 launch products:
1. Gradient Frosted Motivational Sports Water Bottle Set (₦9,500)
2. 24-Piece Gold Stainless Steel Flatware Tableware Set (₦30,000)
3. 16-Piece Modern Grey Dinnerware Set (₦11,500)

Asset Requirements per Product:
- 5s Clean B-Roll Video (9:16 vertical MP4, Gemini Omni Flash, clean motion only, no text/voiceover)
- Staged Photos: 800x800 square and 1080x1350 vertical (4:5)
- Direct Storefront Order Link
- Pre-populated WhatsApp wa.me Order Link
- Copy Swipe File (Casual, Urgency/Scarcity, Food Vendor/Affiliate)
- Centralized Campaign Manifest (`public/campaigns/launch-batch/campaign_manifest.json`)
"""

import argparse
import json
import os
import sys
import time
import re
import urllib.parse
from PIL import Image, ImageFilter
from google import genai
from google.genai import types, errors

# Ensure stdout and stderr are UTF-8 and line-buffered for Windows console compatibility
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)

# Base Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_BASE_DIR = os.path.join(PROJECT_ROOT, "public", "campaigns", "launch-batch")


def load_env_local(project_root):
    """Loads environment variables from .env.local without external dependencies."""
    env_file = os.path.join(project_root, ".env.local")
    env_vars = {}
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                env_vars[k.strip()] = v.strip().strip("'\"")
    return env_vars


# Load config
ENV = load_env_local(PROJECT_ROOT)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or ENV.get("GEMINI_API_KEY", "")
SITE_URL = os.environ.get("NEXT_PUBLIC_SITE_URL") or ENV.get("NEXT_PUBLIC_SITE_URL", "https://jirelkitchen.com")
if "localhost" in SITE_URL:
    SITE_URL = "https://jirelkitchen.com"  # Use canonical live domain for campaign links

WHATSAPP_PHONE = os.environ.get("NEXT_PUBLIC_WHATSAPP_PHONE") or ENV.get("NEXT_PUBLIC_WHATSAPP_PHONE", "2349167053972")
WHATSAPP_PHONE = "".join(filter(str.isdigit, WHATSAPP_PHONE))


# Launch Products Definition
LAUNCH_PRODUCTS = [
    {
        "id": "item-18",
        "folder_name": "gradient-frosted-water-bottle",
        "name": "Gradient Frosted Motivational Sports Water Bottle Set",
        "short_name": "3-Piece Gradient Sports Water Bottle Set",
        "slug": "gradient-frosted-motivational-sport-18",
        "price": 9500,
        "currency": "NGN",
        "currency_symbol": "₦",
        "source_image": "public/images/products/gradient-frosted-motivational-sport-18.webp",
        "category": "Tableware & Drinkware",
        "broll_prompt": (
            "<FIRST_FRAME> Cinematic clean commercial b-roll product shot of the gradient frosted sports water bottles "
            "on a luxury kitchen marble countertop. Clean motion only: smooth subtle slow forward push-in camera movement, "
            "gentle soft warm daylight shifting across the frosted pastel gradient surfaces, subtle ambient reflections. "
            "Strictly silent and clean footage: no voiceover, no speech, no background music, no text overlays, "
            "no titles, no captions, no watermarks, photorealistic 8k commercial cinematography."
        ),
        "copy_swipe": {
            "casual": (
                "Staying hydrated just got an aesthetic upgrade! 💧✨\n\n"
                "Our 3-piece Gradient Frosted Sports Bottle Set makes drinking your daily water effortlessly stylish. "
                "From your home desk to the gym or car cup holder, stay motivated all day with easy-sip silicone straws "
                "and daily time markers.\n\n"
                "✨ Complete 3-Bottle Set: ₦9,500\n"
                "✨ BPA-Free, Durable & Leak-Proof\n"
                "🚚 Fast Lagos dispatch + Nationwide safe delivery\n\n"
                "Tap the link in bio to order yours directly or send us a WhatsApp DM now! 📲"
            ),
            "urgency": (
                "⚡ LIMITED RESTOCK ALERT! Our viral Gradient Frosted 3-Piece Water Bottle Set is moving fast. 🚨\n\n"
                "Get all 3 aesthetic motivational bottles for only ₦9,500 before our current launch batch sells out.\n\n"
                "✅ All 3 sizes included (large, medium & mini)\n"
                "✅ Leak-proof secure lids with silicone straws\n"
                "✅ Orders before 2PM dispatch same-day from Lagos\n\n"
                "👉 Don't wait until it's sold out — tap the direct order link or chat with us on WhatsApp to secure your set today!"
            ),
            "vendor_affiliate": (
                "Looking for high-demand wellness hampers, gym essentials, or client appreciation gifts? 🥗🏋️‍♂️\n\n"
                "The 3-Piece Gradient Frosted Motivational Bottle Set delivers premium pastel aesthetics, high durability, "
                "and instant impulse-buy appeal at an unbeatable ₦9,500 price point.\n\n"
                "💼 Perfect for:\n"
                "• Fitness trainers & wellness communities\n"
                "• Meal prep vendors & lifestyle hampers\n"
                "• School & corporate back-to-work gifts\n\n"
                "📦 Bulk vendor inquiries and affiliate packages available.\n"
                "Direct order link & instant WhatsApp concierge in bio! 📲"
            ),
        },
    },
    {
        "id": "item-10",
        "folder_name": "24-piece-gold-flatware",
        "name": "24-Piece Gold Stainless Steel Flatware Tableware Set",
        "short_name": "24-Piece Gold Cutlery Set with Stand",
        "slug": "24-piece-gold-stainless-steel-flatw-10",
        "price": 30000,
        "currency": "NGN",
        "currency_symbol": "₦",
        "source_image": "public/images/products/24-piece-gold-stainless-steel-flatw-10.webp",
        "category": "Cutlery & Tableware",
        "broll_prompt": (
            "<FIRST_FRAME> Cinematic clean commercial b-roll product shot of the 24-piece gold stainless steel cutlery set "
            "with display stand on a luxury white marble kitchen surface. Clean motion only: slow subtle camera orbit gliding "
            "gently across the polished gold forks, knives, and spoons, soft ambient morning light shimmering off the metallic surfaces. "
            "Strictly silent and clean footage: no voiceover, no speech, no background music, no text overlays, "
            "no titles, no captions, no watermarks, photorealistic 8k commercial cinematography."
        ),
        "copy_swipe": {
            "casual": (
                "Golden hour, every time you dine. ✨🍽️\n\n"
                "Upgrade your table from basic to luxury banquet with our 24-Piece Gold Stainless Steel Flatware Set. "
                "Crafted with balanced ergonomics and a mirror-polished gold finish, it comes complete with dinner forks, "
                "knives, tablespoons, teaspoons, and a clear vertical display stand.\n\n"
                "✨ 24 Pieces (Service for 6) + Organizer Stand\n"
                "✨ Price: ₦30,000\n"
                "✨ Tarnish-resistant & rust-proof culinary steel\n\n"
                "Elevate your Sunday family dinner or date night table — tap link to order now! 💛"
            ),
            "urgency": (
                "Hosting guests this weekend? Don't settle for mismatched cutlery. 👑\n\n"
                "Our flagship 24-Piece Gold Stainless Steel Tableware Set is down to final launch units!\n\n"
                "✨ Heavy-gauge, mirror-polished tarnish-resistant gold finish\n"
                "✨ Includes sleek countertop display organizer\n"
                "✨ Full 24-piece set: ₦30,000\n\n"
                "🚚 Dispatches within 24 hours from Lagos with transit damage guarantee.\n"
                "Click the link or send a WhatsApp DM right now to secure your set before this batch sells out!"
            ),
            "vendor_affiliate": (
                "Attention private chefs, caterers, food content creators, and banquet hosts! 📸🍴\n\n"
                "Presentation is everything. This 24-Piece Mirror-Polished Gold Cutlery Set instantly elevates food plating, "
                "banquet tables, and social video reels.\n\n"
                "🌟 Commercial Highlights:\n"
                "• Substantial heavyweight feel in hand\n"
                "• Scratch-resistant, food-safe gold electroplate\n"
                "• Display stand included for easy mobile event staging\n"
                "• Commercial retail value: ₦30,000\n\n"
                "Shop directly on our storefront or message us on WhatsApp for priority business dispatch & affiliate perks!"
            ),
        },
    },
    {
        "id": "item-5",
        "folder_name": "16-piece-grey-dinnerware",
        "name": "16-Piece Modern Grey Dinnerware Set",
        "short_name": "16-Piece Modern Grey Stoneware Set",
        "slug": "16-piece-modern-grey-dinnerware-set-5",
        "price": 11500,
        "currency": "NGN",
        "currency_symbol": "₦",
        "source_image": "public/images/products/16-piece-modern-grey-dinnerware-set-5.webp",
        "category": "Dinnerware & Ceramics",
        "broll_prompt": (
            "<FIRST_FRAME> Cinematic clean commercial b-roll product shot of the 16-piece modern grey ceramic dinnerware set "
            "beautifully arranged on a luxury kitchen dining table. Clean motion only: elegant slow camera pull-back revealing "
            "the plates, bowls, and mugs, subtle natural sunlight moving softly across the matte grey ceramic surfaces. "
            "Strictly silent and clean footage: no voiceover, no speech, no background music, no text overlays, "
            "no titles, no captions, no watermarks, photorealistic 8k commercial cinematography."
        ),
        "copy_swipe": {
            "casual": (
                "Minimalist, modern, and made for everyday memories. ☕🍲\n\n"
                "Our 16-Piece Modern Grey Ceramic Dinnerware Set brings Scandinavian café aesthetic straight to your dining room. "
                "Full service for 4 includes generous dinner plates, side salad plates, deep cereal/soup bowls, and matching mugs.\n\n"
                "✨ 16 Pieces (Complete Service for 4)\n"
                "✨ Microwave & Dishwasher Safe\n"
                "✨ Introductory Price: ₦11,500\n\n"
                "Treat your home to an effortless tabletop glow-up — tap the order link in bio! 🩶"
            ),
            "urgency": (
                "🔥 UNBEATABLE TABLEWARE VALUE: Full 16-Piece Modern Stoneware Set for only ₦11,500!\n\n"
                "Here is everything inside your package:\n"
                "🍽️ 4 Large Dinner Plates\n"
                "🍽️ 4 Side/Dessert Plates\n"
                "🥣 4 Deep Soup/Cereal Bowls\n"
                "☕ 4 Hot Beverage Mugs\n\n"
                "At this special launch price, stock will not last. 100% Transit Safe Arrival Guarantee across Nigeria.\n"
                "Tap the link or WhatsApp us right now to lock in yours before the price adjusts!"
            ),
            "vendor_affiliate": (
                "Looking for durable, photogenic tableware that makes food presentation pop on camera? 🍳🥑\n\n"
                "The 16-Piece Modern Grey Dinnerware Set offers a timeless neutral satin finish that frames jollof, pasta, "
                "grilled steaks, and soups with contemporary elegance.\n\n"
                "💡 Ideal for:\n"
                "• Airbnb & Shortlet apartments\n"
                "• Restaurants, bistros & cafes\n"
                "• Food stylists & content creators\n"
                "• Full 16-piece package at an accessible ₦11,500\n\n"
                "📍 Fast nationwide fulfillment from Lagos.\n"
                "Direct storefront purchase link & WhatsApp business concierge available now!"
            ),
        },
    },
]


def generate_direct_order_link(site_url, slug):
    """Generates direct storefront link."""
    clean_site_url = site_url.rstrip("/")
    return f"{clean_site_url}/products/{slug}"


def generate_whatsapp_order_link(phone, product_name, price):
    """Generates pre-populated WhatsApp click-to-chat link."""
    message = f"Hello Jirel Kitchen, I want to order the {product_name} for ₦{price:,}"
    encoded = urllib.parse.quote(message)
    return f"https://wa.me/{phone}?text={encoded}"


def export_staged_photos(source_path, target_dir, slug_prefix):
    """Exports 800x800 square and 1080x1350 vertical (4:5) image assets."""
    if not os.path.exists(source_path):
        raise FileNotFoundError(f"Source image not found: {source_path}")

    img = Image.open(source_path).convert("RGB")
    os.makedirs(target_dir, exist_ok=True)

    # 1. Square 800x800 asset
    square_img = img.resize((800, 800), Image.Resampling.LANCZOS)
    square_jpg_path = os.path.join(target_dir, f"{slug_prefix}-800x800.jpg")
    square_webp_path = os.path.join(target_dir, f"{slug_prefix}-800x800.webp")
    square_img.save(square_jpg_path, "JPEG", quality=95)
    square_img.save(square_webp_path, "WEBP", quality=92)

    # 2. Vertical 1080x1350 (4:5 Instagram Portrait) asset
    target_w, target_h = 1080, 1350
    # Background: scale to cover 1080x1350 and apply soft ambient blur
    scale = max(target_w / img.width, target_h / img.height)
    bg_w, bg_h = int(img.width * scale), int(img.height * scale)
    bg = img.resize((bg_w, bg_h), Image.Resampling.LANCZOS)
    left = (bg_w - target_w) // 2
    top = (bg_h - target_h) // 2
    bg = bg.crop((left, top, left + target_w, top + target_h))
    bg = bg.filter(ImageFilter.GaussianBlur(radius=28))

    # Foreground: crisp 1080x1080 scaled product centered vertically
    fg = img.resize((target_w, target_w), Image.Resampling.LANCZOS)
    bg.paste(fg, (0, (target_h - target_w) // 2))

    vertical_jpg_path = os.path.join(target_dir, f"{slug_prefix}-1080x1350.jpg")
    bg.save(vertical_jpg_path, "JPEG", quality=95)

    return {
        "square_800x800_jpg": square_jpg_path,
        "square_800x800_webp": square_webp_path,
        "vertical_1080x1350_jpg": vertical_jpg_path,
    }


def generate_broll_video(client, source_image_path, broll_prompt, output_video_path, force=False):
    """
    Generates a 5-second vertical (9:16) clean B-Roll MP4 using Google Gemini Omni 1.1 Flash.
    """
    if os.path.exists(output_video_path) and not force:
        file_size = os.path.getsize(output_video_path)
        if file_size > 100000:
            print(f"  [Video] Existing B-Roll video found ({file_size / 1024 / 1024:.2f} MB), skipping generation.")
            return output_video_path

    print(f"  [Video] Uploading image asset '{source_image_path}' to Gemini Files API...")
    config = types.UploadFileConfig(
        display_name=os.path.basename(source_image_path),
        mime_type="image/webp",
    )
    uploaded_file = client.files.upload(file=source_image_path, config=config)

    # Poll until file is active
    file_name = uploaded_file.name
    print(f"  [Video] Waiting for File '{file_name}' to become ACTIVE...")
    for _ in range(30):
        info = client.files.get(name=file_name)
        if info.state == "ACTIVE":
            uploaded_file = info
            break
        elif info.state == "FAILED":
            raise RuntimeError(f"File upload processing failed: {info.error}")
        time.sleep(2)

    # Input parts with normalized URI for Gemini Interactions API
    file_id_match = re.search(r'files/([a-zA-Z0-9]+)', uploaded_file.uri)
    norm_uri = f"https://generativelanguage.googleapis.com/files/{file_id_match.group(1)}" if file_id_match else uploaded_file.uri

    input_parts = [
        {"type": "image", "uri": norm_uri, "mime_type": uploaded_file.mime_type or "image/webp"},
        {"type": "text", "text": broll_prompt},
    ]

    video_config = {
        "type": "video",
        "delivery": "uri",
        "aspect_ratio": "9:16",
        "duration": "5s",
        "resolution": "720p",
    }

    print(f"  [Video] Requesting 5s 9:16 video from gemini-omni-1.1-flash...")
    interaction = client.interactions.create(
        model="gemini-omni-1.1-flash",
        input=input_parts,
        response_format=video_config,
    )

    if not interaction.output_video or not interaction.output_video.uri:
        raise RuntimeError("No output video URI returned by Gemini Omni Flash.")

    video_uri = interaction.output_video.uri
    print(f"  [Video] Video generated successfully. Downloading to '{output_video_path}'...")
    video_bytes = client.files.download(file=video_uri)

    os.makedirs(os.path.dirname(output_video_path), exist_ok=True)
    with open(output_video_path, "wb") as f:
        f.write(video_bytes)

    size_mb = os.path.getsize(output_video_path) / (1024 * 1024)
    print(f"  [Video] Saved B-Roll video successfully ({size_mb:.2f} MB).")
    return output_video_path


def main():
    parser = argparse.ArgumentParser(description="Generate self-contained campaign asset packages for launch products.")
    parser.add_argument("--skip-video", action="store_true", help="Skip video generation (render photos, copy & links only).")
    parser.add_argument("--force-video", action="store_true", help="Force re-generation of video even if it exists.")
    parser.add_argument("--product-id", type=str, help="Process only a specific product ID (e.g., item-18, item-10, item-5).")
    args = parser.parse_args()

    print("=====================================================================")
    print("      JIREL KITCHEN HUB — CAMPAIGN ASSET GENERATOR (LAUNCH BATCH)    ")
    print("=====================================================================")
    print(f"Target Output Directory: {OUTPUT_BASE_DIR}")
    print(f"Storefront Base URL:     {SITE_URL}")
    print(f"Concierge WhatsApp:      +{WHATSAPP_PHONE}")
    print(f"Gemini API Key:          {'Configured' if GEMINI_API_KEY else 'MISSING'}")
    print("=====================================================================\n")

    os.makedirs(OUTPUT_BASE_DIR, exist_ok=True)

    # Initialize Gemini client if video generation is enabled
    client = None
    if not args.skip_video:
        if not GEMINI_API_KEY:
            print("ERROR: GEMINI_API_KEY environment variable is not set. Use --skip-video if generating links/photos only.", file=sys.stderr)
            sys.exit(1)
        client = genai.Client(api_key=GEMINI_API_KEY, http_options=types.HttpOptions(timeout=600 * 1000))

    manifest_products = []

    for idx, prod in enumerate(LAUNCH_PRODUCTS, start=1):
        if args.product_id and prod["id"] != args.product_id:
            continue

        print(f"\n[{idx}/3] Processing: {prod['name']} (₦{prod['price']:,})")
        prod_target_dir = os.path.join(OUTPUT_BASE_DIR, prod["folder_name"])
        os.makedirs(prod_target_dir, exist_ok=True)

        # 1. Export High-Res Staged Photos
        print("  [Photos] Rendering 800x800 square and 1080x1350 vertical assets...")
        source_img_full = os.path.join(PROJECT_ROOT, prod["source_image"])
        photo_paths = export_staged_photos(source_img_full, prod_target_dir, prod["folder_name"])
        print(f"  [Photos] Done: {os.path.basename(photo_paths['square_800x800_jpg'])}, {os.path.basename(photo_paths['vertical_1080x1350_jpg'])}")

        # 2. Links
        direct_link = generate_direct_order_link(SITE_URL, prod["slug"])
        whatsapp_link = generate_whatsapp_order_link(WHATSAPP_PHONE, prod["name"], prod["price"])

        # 3. Clean B-Roll Video (5s vertical 9:16)
        video_filename = f"{prod['folder_name']}-broll-5s.mp4"
        video_path = os.path.join(prod_target_dir, video_filename)

        if args.skip_video:
            print("  [Video] Skipping video generation as requested (--skip-video).")
            video_status = "SKIPPED"
            video_rel_path = None
        else:
            try:
                generate_broll_video(
                    client=client,
                    source_image_path=source_img_full,
                    broll_prompt=prod["broll_prompt"],
                    output_video_path=video_path,
                    force=args.force_video,
                )
                video_status = "READY"
                video_rel_path = os.path.relpath(video_path, PROJECT_ROOT).replace("\\", "/")
            except Exception as e:
                print(f"  [Video] Error generating video: {e}", file=sys.stderr)
                video_status = f"ERROR: {str(e)[:100]}"
                video_rel_path = None

        # 4. Save Copy Swipe File
        swipe_file_path = os.path.join(prod_target_dir, "copy-swipe-file.txt")
        with open(swipe_file_path, "w", encoding="utf-8") as f:
            f.write(f"=====================================================================\n")
            f.write(f"COPY SWIPE FILE: {prod['name'].upper()}\n")
            f.write(f"Retail Price: ₦{prod['price']:,}\n")
            f.write(f"Direct Storefront Link: {direct_link}\n")
            f.write(f"WhatsApp Order Link: {whatsapp_link}\n")
            f.write(f"=====================================================================\n\n")

            f.write("--- [OPTION 1: CASUAL / LIFESTYLE] ---\n")
            f.write(prod["copy_swipe"]["casual"] + "\n\n")

            f.write("--- [OPTION 2: URGENCY & SCARCITY] ---\n")
            f.write(prod["copy_swipe"]["urgency"] + "\n\n")

            f.write("--- [OPTION 3: FOOD VENDOR / AFFILIATE / HOSPITALITY] ---\n")
            f.write(prod["copy_swipe"]["vendor_affiliate"] + "\n\n")

        print("  [Copy] Saved copy swipe file to copy-swipe-file.txt")

        # Compile Product Record for Manifest
        product_record = {
            "id": prod["id"],
            "name": prod["name"],
            "short_name": prod["short_name"],
            "slug": prod["slug"],
            "price_ngn": prod["price"],
            "formatted_price": f"₦{prod['price']:,}",
            "category": prod["category"],
            "links": {
                "direct_storefront_url": direct_link,
                "relative_storefront_path": f"/products/{prod['slug']}",
                "whatsapp_order_url": whatsapp_link,
            },
            "media_assets": {
                "broll_video_5s": {
                    "status": video_status,
                    "aspect_ratio": "9:16",
                    "duration_seconds": 5,
                    "resolution": "720x1280",
                    "path": video_rel_path,
                    "filename": video_filename,
                },
                "staged_square_photo": {
                    "dimensions": "800x800",
                    "jpg_path": os.path.relpath(photo_paths["square_800x800_jpg"], PROJECT_ROOT).replace("\\", "/"),
                    "webp_path": os.path.relpath(photo_paths["square_800x800_webp"], PROJECT_ROOT).replace("\\", "/"),
                },
                "staged_vertical_photo": {
                    "dimensions": "1080x1350 (4:5 Portrait)",
                    "jpg_path": os.path.relpath(photo_paths["vertical_1080x1350_jpg"], PROJECT_ROOT).replace("\\", "/"),
                },
            },
            "copy_swipe": prod["copy_swipe"],
            "folder_relative_path": os.path.relpath(prod_target_dir, PROJECT_ROOT).replace("\\", "/"),
        }
        manifest_products.append(product_record)

    # 5. Output Master Campaign Manifest
    manifest_data = {
        "campaign_name": "Jirel Kitchen Hub — Initial Launch Batch",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "base_storefront_url": SITE_URL,
        "concierge_whatsapp_number": f"+{WHATSAPP_PHONE}",
        "batch_directory": os.path.relpath(OUTPUT_BASE_DIR, PROJECT_ROOT).replace("\\", "/"),
        "total_products": len(manifest_products),
        "products": manifest_products,
    }

    manifest_json_path = os.path.join(OUTPUT_BASE_DIR, "campaign_manifest.json")
    with open(manifest_json_path, "w", encoding="utf-8") as f:
        json.dump(manifest_data, f, indent=2, ensure_ascii=False)

    print("\n=====================================================================")
    print("                      CAMPAIGN ASSETS COMPLETED                      ")
    print("=====================================================================")
    print(f"Master Manifest: {manifest_json_path}")
    print(f"Batch Folder:    {OUTPUT_BASE_DIR}\n")
    for p in manifest_products:
        print(f"• {p['name']} (₦{p['price_ngn']:,})")
        print(f"  - Folder:   {p['folder_relative_path']}")
        print(f"  - Video:    {p['media_assets']['broll_video_5s']['status']}")
        print(f"  - Web Link: {p['links']['direct_storefront_url']}")
        print(f"  - WhatsApp: {p['links']['whatsapp_order_url'][:60]}...")
    print("=====================================================================\n")


if __name__ == "__main__":
    main()
