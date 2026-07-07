from duckduckgo_search import DDGS
import json

article = "99411175"
query = f"Grundfos {article} pump"

with DDGS() as ddgs:
    results = ddgs.images(query, max_results=1)
    if results:
        print("Found image:", results[0]['image'])
    else:
        print("No image found.")
