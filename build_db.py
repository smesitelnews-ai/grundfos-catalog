import json
import re
import os

# Sample data extracted from the user's input
raw_data = """
99411175;ALPHA2 25-60 180;GF-Shop : 44 833 ₽ Ссылка;Rus-Grundfos : от 32 000 ₽ (уточняйте);ВсеИнструменты : 46 200 ₽ (наличие уточняется)
99411178;ALPHA2 25-80 180;GF-Shop : 54 890 ₽ Ссылка;ВсеИнструменты : 58 336 ₽ Ссылка;Тепловоз : 57 900 ₽ (под заказ)
97775315;Sololift2 WC-3;Proteplo-SPB : 39 000 ₽ Ссылка;Rus-Grundfos : 51 520 ₽ Ссылка;GF-Shop : 69 985 ₽ Ссылка
012H1900;UNILIFT KP 250-AV1;GF-Shop : 51 775 ₽ Ссылка;Rus-Grundfos : от 35 600 ₽ (прайс);ВсеИнструменты : 54 800 ₽ (резерв)
92713068;SBA 3-45 A;Rus-Grundfos : 45 080 ₽ Ссылка;GF-Shop : 67 375 ₽ Ссылка;Conspar : 72 610 ₽ Ссылка
99160584;ALPHA1 L 25-60 180;ВсеИнструменты : 26 500 ₽;GF-Shop : 29 400 ₽;Теплодвор : 27 800 ₽
97916771;COMFORT 15-14 B PM;GF-Shop : 19 985 ₽ Ссылка;Теплодвор : 21 640 ₽ Ссылка;Тепловоз : 29 744 ₽ Ссылка
012H1800;UNILIFT KP 250-A1;GF-Shop : 49 985 ₽ Ссылка;ВсеИнструменты : 67 834 ₽ Ссылка;Rus-Grundfos : от 39 800 ₽
97775318;Sololift2 D-2;Proteplo-SPB : 31 500 ₽ Ссылка;Терем : 34 578 ₽ Ссылка;Santehnica.ru : 48 532 ₽ Ссылка
011H1900;UNILIFT KP 150-AV1;Rus-Grundfos : 29 440 ₽ Ссылка;GF-Shop : 42 985 ₽ Ссылка;ВсеИнструменты : 39 400 ₽
97775314;Sololift2 WC-1;Santshop : 41 950 ₽ Ссылка;Rus-Grundfos : 46 920 ₽ Ссылка;GF-Shop : 59 100 ₽ Ссылка
59643500;UP 20-30 N 150;Терем : 25 806 ₽ Ссылка;GF-Shop : 37 242 ₽ Ссылка;ВсеИнструменты : 47 367 ₽ Ссылка
92713101;SBA 3-45 AW;Rus-Grundfos : 55 200 ₽ Ссылка;Русклимат : 72 029 ₽ Ссылка;GF-Shop : 83 040 ₽ Ссылка
99411221;ALPHA2 32-60 180;GF-Shop : 56 015 ₽ Ссылка;ВсеИнструменты : 52 100 ₽;Rus-Grundfos : 49 500 ₽
59641500;UP 20-15 N 150;GF-Shop : 31 985 ₽ Ссылка;ВсеИнструменты : 42 279 ₽ Ссылка;Терем : 29 400 ₽
013N1800;UNILIFT KP 350-A1;Tdkomfort : 58 579 ₽ Ссылка;GF-Shop : 63 985 ₽ Ссылка;Rus-Grundfos : от 45 000 ₽
92712336;SB 3-35 AW;Rus-Grundfos : 45 080 ₽ Ссылка;GF-Shop : 49 800 ₽;ВсеИнструменты : 56 400 ₽
95906472;UP 20-45 N 150;GF-Shop : 38 985 ₽ Ссылка;ВсеИнструменты : 44 514 ₽ Ссылка;Терем : 40 800 ₽
92712333;SB 3-35 A;Rus-Grundfos : 34 960 ₽ Ссылка;GF-Shop : 44 200 ₽;ВсеИнструменты : 48 900 ₽
96280966;UNILIFT CC5 - A1;Rus-Grundfos : 17 664 ₽ Ссылка;GF-Shop : 27 985 ₽ Ссылка;ВсеИнструменты : 24 900 ₽
96280970;UNILIFT CC9 - A1;Rus-Grundfos : 26 680 ₽ Ссылка;GF-Shop : 40 685 ₽ Ссылка;ВсеИнструменты : 36 800 ₽
99371964;ALPHA3 32-60 180;Valves-msk : 44 999 ₽ Ссылка;GF-Shop : 48 400 ₽;Rus-Grundfos : 42 100 ₽
99411263;ALPHA2 32-80 180;GF-Shop : 56 201 ₽ Ссылка;ВсеИнструменты : 58 900 ₽;Тепловод : 57 400 ₽
92712346;SB 3-45 AW;Rus-Grundfos : 46 920 ₽ Ссылка;GF-Shop : 56 800 ₽;ВсеИнструменты : 60 400 ₽
"""

def generate_search_url(shop, article):
    shop = shop.lower()
    if 'gf-shop' in shop:
        return f"https://gf-shop.ru/search?q={article}"
    elif 'rus-grundfos' in shop:
        return f"https://rus-grundfos.ru/search/?q={article}"
    elif 'всеинструменты' in shop:
        return f"https://www.vseinstrumenti.ru/search/?what={article}"
    elif 'тепловоз' in shop:
        return f"https://teplovoz.ru/search?q={article}"
    else:
        return f"https://yandex.ru/search/?text={shop}+{article}"

def parse_price(price_str):
    nums = re.findall(r'\d+', price_str)
    if nums:
        return int(''.join(nums))
    return 999999

products = []

for line in raw_data.strip().split('\n'):
    parts = line.split(';')
    if len(parts) < 3:
        continue
    
    article = parts[0].strip()
    name = parts[1].strip()
    
    shops = []
    min_price = float('inf')
    
    for shop_data in parts[2:]:
        if not shop_data.strip():
            continue
        
        if ':' in shop_data:
            shop_name, details = shop_data.split(':', 1)
            shop_name = shop_name.strip()
            details = details.strip()
            
            # Clean up details (remove 'Ссылка')
            details = details.replace('Ссылка', '').strip()
            
            price_val = parse_price(details)
            if price_val > 0 and price_val < 999999:
                if price_val < min_price:
                    min_price = price_val
            
            url = generate_search_url(shop_name, article)
            
            shops.append({
                "name": shop_name,
                "price": price_val,
                "price_text": details,
                "url": url,
                "in_stock": "под заказ" not in details.lower() and "уточняйте" not in details.lower()
            })
            
    products.append({
        "article": article,
        "name": name,
        "min_price": min_price if min_price != float('inf') else 0,
        "shops": sorted(shops, key=lambda x: x['price']),
        "image": "/images/grundfos_pump.png"
    })

os.makedirs('public/images', exist_ok=True)
with open('public/products.json', 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print("Parsed successfully. Saved to public/products.json")
