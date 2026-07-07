import json
import os
import requests
from PIL import Image, ImageDraw, ImageFont

def download_font(url, save_path):
    if not os.path.exists(save_path):
        r = requests.get(url)
        with open(save_path, 'wb') as f:
            f.write(r.content)

def process_test_image():
    font_url = "https://github.com/googlefonts/roboto/raw/main/src/hinted/Roboto-Bold.ttf"
    font_path = "Roboto-Bold.ttf"
    download_font(font_url, font_path)
    
    regular_font_url = "https://github.com/googlefonts/roboto/raw/main/src/hinted/Roboto-Regular.ttf"
    regular_font_path = "Roboto-Regular.ttf"
    download_font(regular_font_url, regular_font_path)

    # Read products
    with open('public/products.json', 'r', encoding='utf-8') as f:
        products = json.load(f)

    # Pick first product
    product = products[0]
    article = product.get('article', '')
    img_path = f"public/images/pumps/{article}.jpg"
    
    if not os.path.exists(img_path):
        print(f"Image not found: {img_path}")
        return

    # Open image
    img = Image.open(img_path)
    w, h = img.size
    
    # Target width 800 for consistency
    target_w = 800
    ratio = target_w / w
    target_h = int(h * ratio)
    img = img.resize((target_w, target_h), Image.LANCZOS)
    
    # We will add a banner at the bottom.
    banner_height = 250
    new_h = target_h + banner_height
    
    # Create new image with white background
    new_img = Image.new('RGB', (target_w, new_h), (255, 255, 255))
    new_img.paste(img, (0, 0))
    
    draw = ImageDraw.Draw(new_img)
    
    # Draw corporate banner (Black and Red)
    # Background for specs (Dark Gray/Black)
    draw.rectangle([(0, target_h), (target_w, new_h - 60)], fill=(30, 30, 30))
    # Red stripe at the bottom for delivery
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
    
    # We'll draw specs in two columns
    col1_x, col2_x = 20, 420
    count = 0
    for key, val in specs.items():
        if count >= 6: # max 6 specs
            break
        text = f"{key}: {val}"
        x = col1_x if count % 2 == 0 else col2_x
        draw.text((x, y_offset), text, fill=(200, 200, 200), font=font_specs)
        
        if count % 2 != 0:
            y_offset += 35
        count += 1

    # Draw Delivery text
    delivery_text = "ДОСТАВКА ПО РФ ИЗ МОСКВЫ СЕГОДНЯ ДО 19:45"
    # Center text
    bbox = draw.textbbox((0, 0), delivery_text, font=font_delivery)
    text_w = bbox[2] - bbox[0]
    text_x = (target_w - text_w) / 2
    draw.text((text_x, new_h - 45), delivery_text, fill=(255, 255, 255), font=font_delivery)
    
    # Save test image to artifacts dir
    out_dir = r"C:\Users\ROM\.gemini\antigravity\brain\50deb5ab-767b-4b53-a433-153d870a8fef\artifacts"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "test_image.jpg")
    new_img.save(out_path, quality=95)
    print(f"Test image saved to {out_path}")
    
    # Make a copy of the original for comparison
    orig_path = os.path.join(out_dir, "orig_image.jpg")
    img.save(orig_path, quality=95)
    print(f"Original image saved to {orig_path}")

if __name__ == "__main__":
    process_test_image()
