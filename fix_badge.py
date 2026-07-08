import requests
from io import BytesIO
from PIL import Image, ImageDraw, ImageFilter
from rembg import remove

# 1. Load and process the badge
print("Loading badge...")
input_badge = Image.open('public/images/badge.png')
print("Removing background with rembg...")
nobg_badge = remove(input_badge)

# 2. Download Grundfos logo
print("Downloading Grundfos logo...")
url = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Grundfos_Logo.svg/1024px-Grundfos_Logo.svg.png"
response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
grundfos_logo = Image.open(BytesIO(response.content)).convert("RGBA")

# Resize logo to fit nicely in the center. The badge is 1024x1024.
# The center circle is probably around 500x500 pixels. 
logo_width = 450
logo_ratio = grundfos_logo.height / grundfos_logo.width
logo_height = int(logo_width * logo_ratio)
grundfos_logo = grundfos_logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)

# 3. Create a dark blue circle to cover the old pump in the center
print("Covering old pump in the center...")
draw = ImageDraw.Draw(nobg_badge)
# Find the exact center
cx, cy = 512, 512
radius = 230 # Approximate radius of the inner blue circle containing the pump
# Sample the dark blue color from the badge
sample_color = input_badge.getpixel((cx, cy - 200)) 
if not isinstance(sample_color, tuple) or len(sample_color) < 3:
    sample_color = (25, 45, 75) # fallback dark blue
    
draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=sample_color)

# 4. Paste the Grundfos logo in the center
print("Pasting new logo...")
paste_x = cx - logo_width // 2
paste_y = cy - logo_height // 2

# We need to paste using the logo's alpha channel as a mask
nobg_badge.paste(grundfos_logo, (paste_x, paste_y), grundfos_logo)

# 5. Save the new badge
print("Saving new badge...")
nobg_badge.save('public/images/badge_new.png')
print("Done!")
