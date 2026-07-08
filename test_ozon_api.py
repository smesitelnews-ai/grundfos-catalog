import urllib.request
import json
import ssl
import time

ssl._create_default_https_context = ssl._create_unverified_context

headers = {
    'Client-Id': '758438',
    'Api-Key': '730d1d83-83d9-48db-af3d-42564449dfbc',
    'Content-Type': 'application/json'
}

req = urllib.request.Request(
    'https://api-seller.ozon.ru/v3/product/list',
    data=json.dumps({'filter': {'visibility': 'ALL'}, 'limit': 100}).encode(),
    headers=headers
)
res = urllib.request.urlopen(req)
data = json.loads(res.read().decode())
items = data.get('result', {}).get('items', [])
product_ids = [i['product_id'] for i in items]

all_items = []
chunk_size = 100
for i in range(0, len(product_ids), chunk_size):
    chunk = product_ids[i:i+chunk_size]
    req2 = urllib.request.Request(
        'https://api-seller.ozon.ru/v3/product/info/list',
        data=json.dumps({'product_id': chunk}).encode(),
        headers=headers
    )
    res2 = urllib.request.urlopen(req2)
    chunk_data = json.loads(res2.read().decode())
    chunk_items = chunk_data.get('result', {}).get('items', [])
    
    if len(chunk_items) == 0:
        print(f"Chunk of {len(chunk)} returned 0 items. Falling back to 1-by-1...")
        for pid in chunk:
            try:
                req3 = urllib.request.Request(
                    'https://api-seller.ozon.ru/v3/product/info/list',
                    data=json.dumps({'product_id': [pid]}).encode(),
                    headers=headers
                )
                res3 = urllib.request.urlopen(req3)
                single_data = json.loads(res3.read().decode())
                single_items = single_data.get('result', {}).get('items', [])
                if len(single_items) == 0:
                    print(f"Product {pid} returned 0 items!")
                else:
                    all_items.extend(single_items)
            except Exception as e:
                print(f"Product {pid} raised error: {e}")
            time.sleep(0.1)
    else:
        all_items.extend(chunk_items)

print(f"Successfully fetched {len(all_items)} items out of {len(product_ids)} IDs.")
