import requests
from bs4 import BeautifulSoup

article = "97775315"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

r = requests.get(f"https://santshop.ru/search/?search={article}", headers=headers)
soup = BeautifulSoup(r.text, 'lxml')

# Print all image tags inside the search result container
for img in soup.find_all('img'):
    print(img.get('src'), img.get('alt'))
