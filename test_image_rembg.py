import json
import os
from PIL import Image, ImageDraw, ImageFont
from rembg import remove

def process_test_image_with_bg():
    font_path = "Roboto-Bold.ttf"
    regular_font_path = "Roboto-Regular.ttf"
    
    # Read products
    with open('public/products.json', 'r', encoding='utf-8') as f:
        products = json.load(f)

    # Pick first product
    product = products[0]
    article = product.get('article', '')
    img_path = f"public/images/pumps/{article}.jpg"
    bg_path = r"C:\Users\ROM\.gemini\antigravity\brain\50deb5ab-767b-4b53-a433-153d870a8fef\bg_fire_water_1783465509085.png"
    
    if not os.path.exists(img_path):
        print(f"Image not found: {img_path}")
        return

    # Open original image and remove background
    print("Removing background from pump...")
    img = Image.open(img_path).convert("RGBA")
    pump_no_bg = remove(img)
    
    # Target width 800 for consistency
    target_w = 800
    ratio = target_w / pump_no_bg.width
    target_h = int(pump_no_bg.height * ratio)
    pump_no_bg = pump_no_bg.resize((target_w, target_h), Image.LANCZOS)
    
    print("Loading background...")
    # Load and resize background
    bg = Image.open(bg_path).convert("RGBA")
    # We want the background to be exactly (target_w, target_h)
    bg = bg.resize((target_w, target_h), Image.LANCZOS)
    
    # Composite pump over background
    print("Compositing...")
    composite = Image.alpha_composite(bg, pump_no_bg)
    
    # We will add a banner at the bottom.
    banner_height = 250
    new_h = target_h + banner_height
    
    # Create new final image
    new_img = Image.new('RGB', (target_w, new_h), (255, 255, 255))
    new_img.paste(composite.convert('RGB'), (0, 0))
    
    draw = ImageDraw.Draw(new_img)
    
    # Draw corporate banner (Black and Red)
    draw.rectangle([(0, target_h), (target_w, new_h - 60)], fill=(30, 30, 30))
    draw.rectangle([(0, new_h - 60), (target_w, new_h)], fill=(204, 0, 0))
    
    # Load fonts
    try:
        font_title = ImageFont.truetype(font_path, 24)
        font_specs = ImageFont.truetype(regular_font_path, 20)
        font_delivery = ImageFont.truetype(font_path, 24)
    except IOError:
        font_title = ImageFont.load_default()
        font_specs = ImageFont.load_default()
        font_delivery = ImageFont.load_default()

    # Draw Title (Product Name)
    name = product.get('name', 'Насос Grundfos').upper()
    draw.text((20, target_h + 15), name, fill=(255, 255, 255), font=font_title)
    
    # Draw Specs
    specs = product.get('specs', {})
    y_offset = target_h + 60
    
    col1_x, col2_x = 20, 420
    count = 0
    for key, val in specs.items():
        if count >= 6:
            break
        text = f"{key}: {val}"
        x = col1_x if count % 2 == 0 else col2_x
        draw.text((x, y_offset), text, fill=(200, 200, 200), font=font_specs)
        if count % 2 != 0:
            y_offset += 35
        count += 1

    # Draw Delivery text
    delivery_text = "Доставка по Москве в день обращения, или отгрузка ТК"
    bbox = draw.textbbox((0, 0), delivery_text, font=font_delivery)
    text_w = bbox[2] - bbox[0]
    text_x = (target_w - text_w) / 2
    draw.text((text_x, new_h - 45), delivery_text, fill=(255, 255, 255), font=font_delivery)
    
    # Save test image to artifacts dir
    out_dir = r"C:\Users\ROM\.gemini\antigravity\brain\50deb5ab-767b-4b53-a433-153d870a8fef\artifacts"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "test_image_rembg.jpg")
    new_img.save(out_path, quality=95)
    print(f"Test image with background replacement saved to {out_path}")

if __name__ == "__main__":
    process_test_image_with_bg()
