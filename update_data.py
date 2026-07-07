import json
import os

quantities = {
    "99411175": 6,
    "99411178": 6,
    "97775315": 5,
    "012H1900": 5,
    "92713068": 5,
    "99160584": 5,
    "97916771": 5,
    "012H1800": 5,
    "97775318": 5,
    "011H1900": 5,
    "97775314": 5,
    "59643500": 2,
    "92713101": 3,
    "99411221": 2,
    "59641500": 2,
    "013N1800": 3,
    "92712336": 1,
    "95906472": 1,
    "92712333": 1,
    "96280966": 1,
    "96280970": 1,
    "99371964": 1,
    "99411263": 1,
    "92712346": 1
}

file_path = 'public/products.json'

with open(file_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

for product in products:
    # Calculate authentic price (minimum price among shops with in_stock == True)
    in_stock_prices = [shop['price'] for shop in product.get('shops', []) if shop.get('in_stock', False)]
    if in_stock_prices:
        authentic_price = min(in_stock_prices)
    else:
        authentic_price = product['min_price'] # fallback

    # Set our price
    product['our_price'] = max(0, authentic_price - 1000)
    
    # Set quantity
    article = product.get('article', '')
    product['quantity'] = quantities.get(article, 0)
    
    # Modify specs
    if 'specs' in product and 'Гарантия' in product['specs']:
        del product['specs']['Гарантия']
        
    # Modify description
    desc = product.get('description', '')
    originality_text = "Оригинальный насос из Европы со всеми сопровождающими документами."
    if desc:
        if originality_text not in desc:
            product['description'] = f"{desc} {originality_text}"
    else:
        product['description'] = originality_text

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print("Data updated successfully.")
