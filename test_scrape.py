import requests
from bs4 import BeautifulSoup
import json

article = "99411175"
url = f"https://rus-grundfos.ru/search/?q={article}"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.text, 'lxml')

# Найти ссылку на первый товар
products = soup.select('.catalog-item-title a, .product-item-title a, .item-title a')
if products:
    product_link = "https://rus-grundfos.ru" + products[0]['href']
    print(f"Найдена ссылка на товар: {product_link}")
    
    # Переходим на страницу товара
    prod_resp = requests.get(product_link, headers=headers)
    prod_soup = BeautifulSoup(prod_resp.text, 'lxml')
    
    # Пробуем найти описание и характеристики
    desc = prod_soup.select_one('.detail-text, .description, [itemprop="description"]')
    print(f"Описание найдено: {bool(desc)}")
    
    specs = prod_soup.select('.detail-properties table, .props-table, table.properties')
    print(f"Характеристики найдены: {bool(specs)}")
else:
    print("Товары не найдены на странице поиска")
    # Выведем кусок HTML чтобы понять селекторы
    print(soup.prettify()[:1000])
