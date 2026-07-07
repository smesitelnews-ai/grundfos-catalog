import json
import os
import time
import requests
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

def download_image(url, filename):
    try:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            os.makedirs(os.path.dirname(filename), exist_ok=True)
            with open(filename, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            return True
    except Exception as e:
        print(f"Error downloading image {url}: {e}")
    return False

def scrape_data():
    data_path = 'public/products.json'
    with open(data_path, 'r', encoding='utf-8') as f:
        products = json.load(f)

    print(f"Starting advanced scraper for {len(products)} products...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        page = context.new_page()

        for idx, product in enumerate(products):
            article = product['article']
            print(f"[{idx+1}/{len(products)}] Scraping article {article}...")
            
            try:
                # 1. Search for the product
                page.goto(f"https://rus-grundfos.ru/search/?q={article}")
                
                # Wait for search results
                try:
                    page.wait_for_selector('.product-item-title a', timeout=5000)
                except:
                    print(f"  No search results found for {article}. Skipping.")
                    continue
                
                # Click the first product
                first_link = page.query_selector('.product-item-title a')
                if not first_link:
                    continue
                    
                product_url = "https://rus-grundfos.ru" + first_link.get_attribute("href")
                page.goto(product_url)
                page.wait_for_load_state("networkidle")
                
                # 2. Extract Data using BeautifulSoup
                html = page.content()
                soup = BeautifulSoup(html, 'lxml')
                
                # Image
                img_tag = soup.select_one('.product-item-detail-slider-image img')
                if img_tag and img_tag.get('src'):
                    img_url = "https://rus-grundfos.ru" + img_tag['src']
                    img_filename = f"public/images/pumps/{article}.jpg"
                    if download_image(img_url, img_filename):
                        product['image'] = f"/images/pumps/{article}.jpg"
                        print("  Image downloaded.")

                # Description
                desc_tag = soup.select_one('[data-value="description"] .product-item-detail-tab-content')
                if not desc_tag:
                    desc_tag = soup.select_one('.product-item-detail-tab-content')
                
                if desc_tag:
                    product['description'] = desc_tag.get_text(separator='\n', strip=True)
                    print("  Description extracted.")
                else:
                    product['description'] = "Подробное описание недоступно."

                # Specs
                specs = {}
                # Bitrix usually uses dl > dt/dd
                dt_elements = soup.select('dt.product-item-detail-properties-name')
                dd_elements = soup.select('dd.product-item-detail-properties-value')
                
                for dt, dd in zip(dt_elements, dd_elements):
                    key = dt.get_text(strip=True).replace(':', '')
                    val = dd.get_text(strip=True)
                    if key and val:
                        specs[key] = val
                
                if specs:
                    product['specs'] = specs
                    print(f"  Extracted {len(specs)} specifications.")
                else:
                    product['specs'] = {"Характеристики": "Не указаны"}

            except Exception as e:
                print(f"  Error scraping {article}: {e}")
            
            time.sleep(1) # Be polite to the server
            
            # Save progress every time to avoid losing data
            with open(data_path, 'w', encoding='utf-8') as f:
                json.dump(products, f, ensure_ascii=False, indent=2)

        browser.close()
    print("Scraping finished. Data saved to public/products.json")

if __name__ == '__main__':
    scrape_data()
