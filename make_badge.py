from PIL import Image, ImageDraw

def make_circle_transparent(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    
    # Create a mask
    mask = Image.new("L", img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, img.size[0], img.size[1]), fill=255)
    
    # Apply mask
    result = Image.new("RGBA", img.size, (0,0,0,0))
    result.paste(img, mask=mask)
    
    result.save(output_path)
    print("Circular badge created!")

make_circle_transparent('C:/Users/ROM/.gemini/antigravity/brain/50deb5ab-767b-4b53-a433-153d870a8fef/originality_stamp_1783467360482.png', 'public/images/badge.png')
