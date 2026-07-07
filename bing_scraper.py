import requests
from bs4 import BeautifulSoup
import json
import os
import time
import urllib.parse

def get_image_from_bing(query):
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'lxml')
        
        # Bing images are usually stored in 'm' attribute as a JSON string
        images = soup.select('a.iusc')
        if images:
            for img in images:
                try:
                    m = json.loads(img.get('m', '{}'))
                    murl = m.get('murl')
                    if murl and (murl.endswith('.jpg') or murl.endswith('.png') or 'grundfos' in murl.lower()):
                        return murl
                except Exception:
                    continue
            
            # fallback: just get the first one
            try:
                return json.loads(images[0].get('m', '{}')).get('murl')
            except:
                pass
    except Exception as e:
        print(f"Error searching bing for {query}: {e}")
        
    return None

def download_image(url, filepath):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(url, stream=True, headers=headers, timeout=10)
        if response.status_code == 200:
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
    return False

def main():
    data_path = 'public/products.json'
    with open(data_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    print(f"Searching images for {len(products)} products on Bing...")
    
    updates_made = False

    for idx, p in enumerate(products):
        article = p['article']
        name = p['name']
        print(f"[{idx+1}/{len(products)}] Searching image for: Grundfos {article} {name}")
        
        query = f"Grundfos pump {article}"
        img_url = get_image_from_bing(query)
        
        if img_url:
            print(f"  Found URL: {img_url}")
            filepath = f"public/images/pumps/{article}.jpg"
            
            if download_image(img_url, filepath):
                p['image'] = f"/images/pumps/{article}.jpg"
                updates_made = True
                print("  Downloaded successfully.")
            else:
                print("  Failed to download image.")
        else:
            print("  No image found.")
            
        time.sleep(1) # Be polite
        
    if updates_made:
        with open(data_path, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        print("Updated products.json with real images!")
    else:
        print("No updates made.")

if __name__ == "__main__":
    main()
