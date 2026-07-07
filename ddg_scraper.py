import json
import os
import time
import requests
from duckduckgo_search import DDGS

def is_safe_image(result, article, name):
    title = result.get('title', '').lower()
    url = result.get('image', '').lower()
    
    # Must contain some pump-related terms or the manufacturer or the article
    valid_keywords = ['pump', 'насос', 'grundfos', 'sololift', 'unilift', 'alpha', 'sba', 'up', article.lower()]
    has_keyword = any(kw in title or kw in url for kw in valid_keywords)
    
    # Filter out known spammy domains or adult terms just in case
    blacklist = ['fappening', 'nude', 'sexy', 'hentai', 'porn', 'leak', 'avatar']
    is_blacklisted = any(bl in url or bl in title for bl in blacklist)
    
    return has_keyword and not is_blacklisted

def download_image(url, filepath):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = requests.get(url, stream=True, headers=headers, timeout=10)
        if response.status_code == 200:
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            return True
    except Exception as e:
        print(f"  Failed to download {url}: {e}")
    return False

def main():
    data_path = 'public/products.json'
    with open(data_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    print(f"Searching verified images for {len(products)} products using DuckDuckGo...")
    
    updates_made = False

    with DDGS() as ddgs:
        for idx, p in enumerate(products):
            article = p['article']
            name = p['name']
            
            # If we already have a real image locally, don't re-download
            local_img_path = f"public/images/pumps/{article}.jpg"
            if os.path.exists(local_img_path):
                print(f"[{idx+1}/{len(products)}] Image already exists for {article}. Skipping.")
                p['image'] = f"/images/pumps/{article}.jpg"
                updates_made = True
                continue
                
            print(f"[{idx+1}/{len(products)}] Searching image for: Grundfos {article} {name}")
            
            query = f"Grundfos {article} {name}"
            try:
                results = ddgs.images(query, max_results=10)
                if results:
                    downloaded = False
                    for res in results:
                        if is_safe_image(res, article, name):
                            img_url = res['image']
                            print(f"  Found verified image URL: {img_url}")
                            if download_image(img_url, local_img_path):
                                p['image'] = f"/images/pumps/{article}.jpg"
                                updates_made = True
                                downloaded = True
                                print("  Downloaded successfully.")
                                break
                    if not downloaded:
                        print("  No safe/verified images matched our filters.")
                else:
                    print("  No search results returned.")
            except Exception as e:
                print(f"  Error searching DDG for {article}: {e}")
                
            time.sleep(1) # Be polite
            
            # Save progress incrementally
            if updates_made:
                with open(data_path, 'w', encoding='utf-8') as f:
                    json.dump(products, f, ensure_ascii=False, indent=2)
                    
    print("Finished processing images.")

if __name__ == "__main__":
    main()
