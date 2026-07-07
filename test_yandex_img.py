from playwright.sync_api import sync_playwright

def test_yandex():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        try:
            page.goto("https://yandex.ru/images/search?text=Grundfos+99411175", wait_until="domcontentloaded", timeout=15000)
            print("Page loaded.")
            page.wait_for_selector(".serp-item__link", timeout=5000)
            img = page.query_selector("img.serp-item__thumb")
            if img:
                print("Found image:", img.get_attribute("src"))
        except Exception as e:
            print("Error:", e)
        browser.close()

if __name__ == '__main__':
    test_yandex()
