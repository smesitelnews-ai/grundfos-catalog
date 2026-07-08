import urllib.request
from PIL import Image, ImageDraw, ImageFont
import math

def create_badge():
    # 1. Загрузить логотип Grundfos (нашел PNG с прозрачным фоном на вики или аналогичном)
    url = "https://iconape.com/wp-content/files/cw/110531/png/grundfos-logo.png"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response, open('grundfos_logo_temp.png', 'wb') as out_file:
        out_file.write(response.read())
    
    # Открываем логотип
    logo = Image.open("grundfos_logo_temp.png").convert("RGBA")
    
    # 2. Открываем наш фон с огнем и водой
    bg = Image.open("public/images/bg_0.jpg").convert("RGBA")
    
    # Вырезаем квадрат из центра фона для бейджа
    size = 400
    w, h = bg.size
    left = (w - size) // 2
    top = (h - size) // 2
    bg_cropped = bg.crop((left, top, left + size, top + size))
    
    # 3. Делаем его круглым
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size, size), fill=255)
    
    badge = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    badge.paste(bg_cropped, (0, 0), mask)
    
    # 4. Добавляем золотую обводку (несколько кругов для толщины)
    gold = (255, 215, 0, 255)
    badge_draw = ImageDraw.Draw(badge)
    thickness = 8
    for i in range(thickness):
        badge_draw.ellipse((i, i, size - i, size - i), outline=gold)
    
    # 5. Вставляем логотип по центру
    # Меняем размер логотипа чтобы влез
    logo_w, logo_h = logo.size
    new_w = 260
    new_h = int(logo_h * (new_w / logo_w))
    logo = logo.resize((new_w, new_h))
    
    logo_x = (size - new_w) // 2
    logo_y = (size - new_h) // 2
    badge.paste(logo, (logo_x, logo_y), logo)
    
    # 6. Сохраняем
    badge.save("public/images/badge.png")
    print("New badge created successfully.")

if __name__ == "__main__":
    create_badge()
