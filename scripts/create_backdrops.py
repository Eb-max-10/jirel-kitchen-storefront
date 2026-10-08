import math
import urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

out_dir = Path("public/images/backgrounds")
out_dir.mkdir(parents=True, exist_ok=True)

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

def download_image(url: str) -> Image.Image:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return Image.open(resp).convert("RGB")

def create_studio_backdrop(surface_img: Image.Image, wall_color: tuple, horizon_y: int = 460) -> Image.Image:
    """
    Creates an 800x800 photographic studio backdrop:
    - Upper area (y: 0 to horizon_y): Softly lit wall with gentle gradient and soft depth of field
    - Lower area (y: horizon_y to 800): Surface plane with subtle forward perspective and studio lighting
    """
    canvas = Image.new("RGBA", (800, 800), wall_color + (255,))
    draw = ImageDraw.Draw(canvas)

    # 1. Soft wall lighting gradient (vignette / ambient light from top-left)
    for y in range(horizon_y + 10):
        factor = y / horizon_y
        # Soft ambient light from slightly warm top
        r = int(wall_color[0] * (1.02 - 0.05 * factor))
        g = int(wall_color[1] * (1.02 - 0.05 * factor))
        b = int(wall_color[2] * (1.02 - 0.04 * factor))
        draw.line([(0, y), (800, y)], fill=(min(255, r), min(255, g), min(255, b), 255))

    # Add soft radial ambient glow to wall
    glow = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([(-100, -100), (900, 700)], fill=(255, 255, 255, 35))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=80))
    canvas.paste(glow, (0, 0), mask=glow)

    # 2. Surface plane (Countertop / Tabletop)
    surface_h = 800 - horizon_y
    # Crop and resize surface image to fit the surface plane
    sw, sh = surface_img.size
    crop_aspect = 800 / surface_h
    if sw / sh > crop_aspect:
        new_sw = int(sh * crop_aspect)
        surface_cropped = surface_img.crop(((sw - new_sw) // 2, 0, (sw + new_sw) // 2, sh))
    else:
        new_sh = int(sw / crop_aspect)
        surface_cropped = surface_img.crop((0, sh - new_sh, sw, sh))

    surface_resized = surface_cropped.resize((800, surface_h), Image.Resampling.LANCZOS)
    
    # Apply soft perspective darkening towards the back edge (ambient occlusion at horizon)
    surface_rgba = surface_resized.convert("RGBA")
    surf_draw = ImageDraw.Draw(surface_rgba)
    
    # Subtle depth-of-field transition: blur slightly near the back horizon
    blur_surface = surface_rgba.filter(ImageFilter.GaussianBlur(radius=3))
    
    # Blend sharp foreground with slightly softer back edge
    mask = Image.new("L", (800, surface_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    for y in range(surface_h):
        alpha = int(255 * (y / surface_h) ** 0.8)
        mask_draw.line([(0, y), (800, y)], fill=alpha)
        
    surface_final = Image.composite(surface_rgba, blur_surface, mask)
    
    # Paste surface onto canvas
    canvas.paste(surface_final, (0, horizon_y))
    
    # 3. Horizon seam shadow & highlight line
    seam = Image.new("RGBA", (800, 800), (0, 0, 0, 0))
    seam_draw = ImageDraw.Draw(seam)
    # Dark occlusion line right at horizon
    seam_draw.line([(0, horizon_y), (800, horizon_y)], fill=(0, 0, 0, 50), width=3)
    # Subtle light bounce line just below horizon
    seam_draw.line([(0, horizon_y + 2), (800, horizon_y + 2)], fill=(255, 255, 255, 60), width=1)
    seam = seam.filter(ImageFilter.GaussianBlur(radius=2))
    canvas.paste(seam, (0, 0), mask=seam)

    return canvas.convert("RGB")

print("Studio backdrop creator ready")
