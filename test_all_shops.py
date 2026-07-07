import requests
from bs4 import BeautifulSoup
import re

article = "97775315" # Sololift2 WC-3
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def try_teplodvor():
    url = f"https://www.teplodvor.ru/search/?search={article}"
    try:
        r = requests.get(url, headers=headers, timeout=10)
        print(f"Teplodvor status: {r.status_code}")
        soup = BeautifulSoup(r.text, 'lxml')
        # Find product image in search results
        img = soup.select_one('.product-card__image img, .catalog-list img')
        if img:
            src = img.get('src') or img.get('data-src')
            if src:
                return src
    except Exception as e:
        print(f"Teplodvor error: {e}")
    return None

def try_teplovoz():
    url = f"https://teplovoz.ru/search/?q={article}"
    try:
        r = requests.get(url, headers=headers, timeout=10)
        print(f"Teplovoz status: {r.status_code}")
        soup = BeautifulSoup(r.text, 'lxml')
        img = soup.select_one('.product-item-image img, .catalog-item img')
        if img:
            src = img.get('src')
            if src:
                return src
    except Exception as e:
        print(f"Teplovoz error: {e}")
    return None

def try_santshop():
    url = f"https://santshop.ru/search/?search={article}"
    try:
        r = requests.get(url, headers=headers, timeout=10)
        print(f"Santshop status: {r.status_code}")
        soup = BeautifulSoup(r.text, 'lxml')
        img = soup.select_one('.product-thumb img')
        if img:
            src = img.get('src')
            if src:
                return src
    except Exception as e:
        print(f"Santshop error: {e}")
    return None

print("Testing different shops...")
print("Teplodvor:", try_teplodvor())
print("Teplovoz:", try_teplovoz())
print("Santshop:", try_santshop())
