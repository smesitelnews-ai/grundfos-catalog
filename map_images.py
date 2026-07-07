import json

data_path = 'public/products.json'
with open(data_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

for p in products:
    name = p['name'].upper()
    if 'SOLOLIFT' in name:
        p['image'] = '/images/sololift.png'
    elif 'UNILIFT' in name:
        p['image'] = '/images/unilift.png'
    elif 'SBA' in name or 'SB ' in name:
        p['image'] = '/images/sb_pump.png'
    elif 'COMFORT' in name:
        p['image'] = '/images/comfort_pump.png'
    else:
        p['image'] = '/images/grundfos_pump.png'

with open(data_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print("Mapped images successfully.")
