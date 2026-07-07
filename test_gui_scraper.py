from playwright.sync_api import sync_playwright

def test_gui():
    with sync_playwright() as p:
        print("Launching visible browser...")
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        print("Navigating to rus-grundfos.ru...")
        page.goto("https://rus-grundfos.ru/search/?q=99411175", wait_until="domcontentloaded")
        print("Page title:", page.title())
        
        # Check if we got blocked
        content = page.content()
        if "captcha" in content.lower() or "cloudflare" in content.lower():
            print("Detected CAPTCHA or Cloudflare protection.")
        else:
            print("Successfully loaded without block!")
            
            # extract image link
            img = page.query_selector('.product-item-image-wrapper img')
            if img:
                print("Found image:", img.get_attribute("src"))
            
        browser.close()

if __name__ == '__main__':
    test_gui()
