import urllib.request
import json
import urllib.error

req = urllib.request.Request(
    'http://localhost:3001/api/ozon/products',
    data=json.dumps({'clientId': '758438', 'apiKey': '730d1d83-83d9-48db-af3d-42564449dfbc'}).encode(),
    headers={'Content-Type': 'application/json'}
)
try:
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode())
    print(f"Success: {data.get('success')}")
    print(f"Products count: {len(data.get('products', []))}")
except urllib.error.HTTPError as e:
    print(f"Error {e.code}: {e.read().decode()}")
