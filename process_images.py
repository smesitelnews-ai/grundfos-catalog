import json
import os
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
from rembg import remove

# Paths
PRODUCTS_FILE = 'public/products.json'
INPUT_DIR = 'public/images/pumps'
OUTPUT_DIR = 'public/images/pumps_processed'
BG_IMAGE_PATH = r'C:\Users\ROM\.gemini\antigravity\brain\50deb5ab-767b-4b53-a433-153d870a8fef\fire_water_bg_1783467792465.png'
FONT_BOLD = 'Roboto-Bold.ttf'
FONT_REGULAR = 'Roboto-Regular.ttf'

# Ensure output dir exists
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# Load background
bg_full = Image.open(BG_IMAGE_PATH).convert('RGB')
# Resize background to 1080x1080 (crop if necessary)
bg_aspect = bg_full.width / bg_full.height
if bg_aspect > 1:
    # Wider
    new_w = int(1080 * bg_aspect)
    bg_resized = bg_full.resize((new_w, 1080), Image.Resampling.LANCZOS)
    left = (new_w - 1080) // 2
    bg_cropped = bg_resized.crop((left, 0, left + 1080, 1080))
else:
    # Taller
    new_h = int(1080 / bg_aspect)
    bg_resized = bg_full.resize((1080, new_h), Image.Resampling.LANCZOS)
    top = (new_h - 1080) // 2
    bg_cropped = bg_resized.crop((0, top, 1080, top + 1080))

# Load fonts
try:
    font_title = ImageFont.truetype(FONT_BOLD, 36)
    font_spec = ImageFont.truetype(FONT_REGULAR, 24)
    font_footer = ImageFont.truetype(FONT_BOLD, 28)
except Exception as e:
    print(f"Font loading error: {e}")
    # Fallback to default
    font_title = ImageFont.load_default()
    font_spec = ImageFont.load_default()
    font_footer = ImageFont.load_default()

with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
    products = json.load(f)

for p in products:
    article = p['article']
    input_path = os.path.join(INPUT_DIR, f"{article}.jpg")
    output_path = os.path.join(OUTPUT_DIR, f"{article}.jpg")
    
    if not os.path.exists(input_path):
        print(f"Skipping {article}, image not found.")
        continue
        
    print(f"Processing {article}...")
    
    # 1. Remove background from pump
    with open(input_path, 'rb') as i_f:
        input_data = i_f.read()
        try:
            subject_data = remove(input_data)
        except Exception as e:
            print(f"Error running rembg for {article}: {e}")
            continue
            
    # Load subject image
    import io
    subject_img = Image.open(io.BytesIO(subject_data)).convert("RGBA")
    
    # Optional: enhance contrast slightly
    enhancer = ImageEnhance.Contrast(subject_img)
    subject_img = enhancer.enhance(1.1)
    
    # Resize subject to fit within 800x800
    subject_img.thumbnail((800, 800), Image.Resampling.LANCZOS)
    
    # Create final image 1080x1350
    final_img = Image.new('RGB', (1080, 1350), color='#222222')
    
    # Paste fire/water background
    final_img.paste(bg_cropped, (0, 0))
    
    # Paste pump
    pump_x = (1080 - subject_img.width) // 2
    pump_y = (1080 - subject_img.height) // 2
    final_img.paste(subject_img, (pump_x, pump_y), subject_img)
    
    # Draw text
    draw = ImageDraw.Draw(final_img)
    
    # Title
    draw.text((40, 1110), p['name'], font=font_title, fill='#FFFFFF')
    
    # Specs
    specs = p.get('specs', {})
    spec_keys = list(specs.keys())
    
    # Select up to 6 important specs
    selected_specs = []
    priorities = ['Производитель', 'Тип насоса', 'Максимальный напор', 'Материал корпуса', 'Диаметр подключения', 'Монтажная длина', 'Максимальный расход', 'Напряжение сети']
    for prio in priorities:
        if prio in specs:
            selected_specs.append((prio, specs[prio]))
    for k in spec_keys:
        if len(selected_specs) >= 6:
            break
        if k not in priorities:
            selected_specs.append((k, specs[k]))
            
    # Draw specs
    y_start = 1170
    line_height = 35
    for i, (k, v) in enumerate(selected_specs[:6]):
        col = i % 2
        row = i // 2
        x = 40 if col == 0 else 560
        y = y_start + row * line_height
        
        # Truncate value if too long
        v_str = str(v)
        if len(v_str) > 30:
            v_str = v_str[:27] + "..."
            
        text = f"{k}: {v_str}"
        draw.text((x, y), text, font=font_spec, fill='#CCCCCC')
        
    # Red Footer
    footer_rect = [(0, 1280), (1080, 1350)]
    draw.rectangle(footer_rect, fill='#CC0000')
    
    footer_text = "Доставка по Москве в день обращения, или отгрузка ТК"
    # Center text
    bbox = draw.textbbox((0, 0), footer_text, font=font_footer)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = (1080 - w) / 2
    y = 1280 + (70 - h) / 2 - 4 # offset adjustment
    
    draw.text((x, y), footer_text, font=font_footer, fill='#FFFFFF')
    
    # Save final image
    final_img.save(output_path, quality=95)
    
print("All images processed successfully!")
