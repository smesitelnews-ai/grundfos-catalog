import json

data_path = 'public/products.json'
with open(data_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

for p in products:
    p['image'] = '/images/grundfos_pump.png'

with open(data_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print("Restored original images.")
