from PIL import Image, ImageDraw, ImageFont
import os

print("Processing badge...")
badge = Image.open('public/images/badge.png').convert("RGBA")
width, height = badge.size
cx, cy = width // 2, height // 2

# 1. Mask out the fake checkerboard background
print("Removing checkerboard...")
mask = Image.new('L', (width, height), 0)
draw_mask = ImageDraw.Draw(mask)
# The gold ring radius is likely around 480 for a 1024x1024 image
radius_outer = 480
draw_mask.ellipse((cx - radius_outer, cy - radius_outer, cx + radius_outer, cy + radius_outer), fill=255)

# Apply mask
nobg_badge = Image.new("RGBA", (width, height))
nobg_badge.paste(badge, (0,0), mask)

# 2. Cover the old pump in the center
print("Covering old pump...")
draw = ImageDraw.Draw(nobg_badge)
radius_inner = 230 # Approximate radius to cover the inner drawing
# Match the dark blue color from the badge
sample_color = badge.getpixel((cx, cy - 200))
if not isinstance(sample_color, tuple) or len(sample_color) < 3:
    sample_color = (20, 35, 60, 255) # fallback dark blue
else:
    sample_color = (sample_color[0], sample_color[1], sample_color[2], 255)

draw.ellipse((cx - radius_inner, cy - radius_inner, cx + radius_inner, cy + radius_inner), fill=sample_color)

# 3. Add GRUNDFOS text
print("Adding GRUNDFOS text...")
try:
    font = ImageFont.truetype('public/fonts/Roboto-Bold.ttf', 110)
except:
    font = ImageFont.load_default()

text = "GRUNDFOS"
bbox = draw.textbbox((0, 0), text, font=font)
w = bbox[2] - bbox[0]
h = bbox[3] - bbox[1]

text_x = cx - w // 2
text_y = cy - h // 2 - 20 # Offset slightly up

# Add a subtle shadow to the text for depth
draw.text((text_x + 3, text_y + 3), text, font=font, fill=(0, 0, 0, 150))
draw.text((text_x, text_y), text, font=font, fill=(255, 255, 255, 255))

# Optional: Add "AUTHENTIC" below
try:
    font_small = ImageFont.truetype('public/fonts/Roboto-Bold.ttf', 45)
except:
    font_small = ImageFont.load_default()

text2 = "ORIGINAL"
bbox2 = draw.textbbox((0, 0), text2, font=font_small)
w2 = bbox2[2] - bbox2[0]
text_x2 = cx - w2 // 2
text_y2 = text_y + h + 30

draw.text((text_x2, text_y2), text2, font=font_small, fill=(210, 180, 100, 255)) # Gold color

print("Saving...")
# Overwrite the old badge
nobg_badge.save('public/images/badge.png')
print("Done!")
