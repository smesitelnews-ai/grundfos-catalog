import os
import time
import subprocess
import requests
from playwright.sync_api import sync_playwright

# 1. Check if the server is already running on port 3001
server_url = "http://localhost:3001/product/95906472"
server_running = False

try:
    r = requests.get(server_url, timeout=3)
    print("Server is already running. Status code of product page:", r.status_code)
    server_running = True
except Exception:
    print("Server is not running. Starting next dev on port 3001...")

dev_process = None
if not server_running:
    # Start the server as a background process
    dev_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=os.getcwd(),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=True
    )
    # Wait for the server to spin up
    print("Waiting 6 seconds for Next.js to start...")
    time.sleep(6)
    
    # Try connecting again
    try:
        r = requests.get(server_url, timeout=3)
        print("Next dev started successfully! Status code:", r.status_code)
    except Exception as e:
        print("Failed to connect to the started server:", e)

# 2. Run Playwright to navigate and capture screenshot
chrome_paths = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
]
executable_path = None
for path in chrome_paths:
    if os.path.exists(path):
        executable_path = path
        break

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=executable_path, headless=False)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        
        print("Navigating to product page in browser...")
        page.goto(server_url, wait_until="load")
        time.sleep(3) # Wait for hydration/render
        
        screenshot_path = "product_page_test.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot successfully saved to: {screenshot_path}")
        print("Page Title:", page.title())
        
        # Verify content
        h1 = page.query_selector("h1")
        if h1:
            print("Product Heading found:", h1.inner_text())
        else:
            print("No H1 heading found (might be 404).")
            
        browser.close()
except Exception as e:
    print("Playwright test error:", e)

# Clean up dev process if we started it
if dev_process:
    dev_process.terminate()
    print("Stopped background dev server process.")
