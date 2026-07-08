import json
import os
import io
import hashlib
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
from rembg import remove

# Paths
PRODUCTS_FILE = 'public/products.json'
INPUT_DIR = 'public/images/pumps'
OUTPUT_DIR = 'public/images/pumps_v9'
BG_DIR = 'public/images/bg'
BADGE_PATH = ''
FONT_BOLD = 'public/fonts/Roboto-Bold.ttf'
FONT_REGULAR = 'public/fonts/Roboto-Regular.ttf'

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

bg_images = []
for f in os.listdir(BG_DIR):
    if f.endswith('.png') or f.endswith('.jpg'):
        try:
            bg_full = Image.open(os.path.join(BG_DIR, f)).convert('RGB')
            bg_aspect = bg_full.width / bg_full.height
            if bg_aspect > 1:
                new_w = int(1080 * bg_aspect)
                bg_resized = bg_full.resize((new_w, 1080), Image.Resampling.LANCZOS)
                left = (new_w - 1080) // 2
                bg_cropped = bg_resized.crop((left, 0, left + 1080, 1080))
            else:
                new_h = int(1080 / bg_aspect)
                bg_resized = bg_full.resize((1080, new_h), Image.Resampling.LANCZOS)
                top = (new_h - 1080) // 2
                bg_cropped = bg_resized.crop((0, top, 1080, top + 1080))
            bg_images.append(bg_cropped)
        except Exception as e:
            print(f"Error loading background {f}: {e}")

if not bg_images:
    print("No backgrounds found in public/images/bg/")
    exit(1)

try:
    font_title = ImageFont.truetype(FONT_BOLD, 36)
    font_spec = ImageFont.truetype(FONT_REGULAR, 22)
    font_price = ImageFont.truetype(FONT_BOLD, 46)
    font_footer = ImageFont.truetype(FONT_BOLD, 28)
except Exception as e:
    print(f"Font loading error: {e}")
    font_title = ImageFont.load_default()
    font_spec = ImageFont.load_default()
    font_price = ImageFont.load_default()
    font_footer = ImageFont.load_default()

badge_img = None
if os.path.exists(BADGE_PATH):
    badge_img = Image.open(BADGE_PATH).convert("RGBA")
    badge_img.thumbnail((250, 250), Image.Resampling.LANCZOS)

with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
    products = json.load(f)

for p in products:
    article = p['article']
    input_path = os.path.join(INPUT_DIR, f"{article}.jpg")
    output_path = os.path.join(OUTPUT_DIR, f"{article}.jpg")
    
    if not os.path.exists(input_path):
        print(f"Skipping {article}, image not found in {input_path}")
        continue
        
    print(f"Processing {article}...")
    
    with open(input_path, 'rb') as i_f:
        input_data = i_f.read()
        try:
            subject_data = remove(input_data)
        except Exception as e:
            print(f"Error running rembg for {article}: {e}")
            continue
            
    subject_img = Image.open(io.BytesIO(subject_data)).convert("RGBA")
    
    enhancer = ImageEnhance.Contrast(subject_img)
    subject_img = enhancer.enhance(1.1)
    
    # Auto-crop by bounding box
    bbox = subject_img.getbbox()
    if bbox:
        subject_img = subject_img.crop(bbox)
        
    # Scale to exactly 700px on the longest side to be uniformly large
    max_dim = 700
    w, h = subject_img.size
    scale = max_dim / max(w, h)
    new_w, new_h = int(w * scale), int(h * scale)
    subject_img = subject_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Pick background based on hash
    h_idx = int(hashlib.md5(str(article).encode()).hexdigest(), 16) % len(bg_images)
    bg = bg_images[h_idx]
    
    final_img = Image.new('RGB', (1080, 1350), color='#222222')
    final_img.paste(bg, (0, 0))
    
    pump_x = (1080 - subject_img.width) // 2
    pump_y = (1080 - subject_img.height) // 2
    final_img.paste(subject_img, (pump_x, pump_y - 80), subject_img)
    
    if badge_img:
        # Paste badge
        final_img.paste(badge_img, (1080 - badge_img.width - 40, 40), badge_img)
    
    draw = ImageDraw.Draw(final_img)
    
    # Text block BG
    draw.rectangle([(0, 1050), (1080, 1280)], fill='#1a1a1a')
    
    draw.text((40, 1070), p['name'], font=font_title, fill='#FFFFFF')
    
    specs = p.get('specs', {})
    spec_keys = list(specs.keys())
    
    selected_specs = []
    priorities = ['Производитель', 'Тип насоса', 'Максимальный напор', 'Материал корпуса', 'Максимальный расход', 'Напряжение сети']
    for prio in priorities:
        if prio in specs:
            selected_specs.append((prio, specs[prio]))
    for k in spec_keys:
        if len(selected_specs) >= 6:
            break
        if k not in priorities:
            selected_specs.append((k, specs[k]))
            
    y_start = 1130
    line_height = 42
    for i, (k, v) in enumerate(selected_specs[:6]):
        col = i % 2
        row = i // 2
        x = 40 if col == 0 else 550
        y = y_start + row * line_height
        
        v_str = str(v)
        full_text = f"{k}: {v_str}"
        if len(full_text) > 42:
            full_text = full_text[:39] + "..."
            
        draw.text((x, y), full_text, font=font_spec, fill='#CCCCCC')
        
    draw.rectangle([(0, 1280), (1080, 1350)], fill='#CC0000')
    footer_text = "Доставка по Москве в день обращения, или отгрузка ТК"
    bbox = draw.textbbox((0, 0), footer_text, font=font_footer)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (1080 - tw) / 2
    ty = 1280 + (70 - th) / 2 - 4
    draw.text((tx, ty), footer_text, font=font_footer, fill='#FFFFFF')
    
    final_img.save(output_path, quality=95)
    
print("All images processed successfully!")
