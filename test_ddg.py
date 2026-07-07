import requests
from bs4 import BeautifulSoup
import re

article = "99411175"
query = f"Grundfos {article}"
url = f"https://html.duckduckgo.com/html/?q={query}"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

r = requests.get(url, headers=headers)
print("Status:", r.status_code)
soup = BeautifulSoup(r.text, 'lxml')

# Print search results snippets
for a in soup.select('.result__snippet'):
    print(a.get_text(strip=True))
