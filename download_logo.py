import urllib.request
import os

url = "https://seeklogo.com/images/G/grundfos-logo-DCA7DD2902-seeklogo.com.png"
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response, open('public/images/grundfos_badge_logo.png', 'wb') as out_file:
        data = response.read()
        out_file.write(data)
    print("Downloaded seeklogo.")
except Exception as e:
    print("Seeklogo failed:", e)
    # Fallback to another source
    url2 = "https://w7.pngwing.com/pngs/309/258/png-transparent-grundfos-logo-industry-business-pump-business-text-people-logo.png"
    req2 = urllib.request.Request(url2, headers=headers)
    try:
        with urllib.request.urlopen(req2) as response, open('public/images/grundfos_badge_logo.png', 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        print("Downloaded fallback logo.")
    except Exception as e2:
        print("Fallback failed:", e2)
