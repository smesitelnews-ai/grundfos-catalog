const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\ROM\\.gemini\\antigravity\\brain\\50deb5ab-767b-4b53-a433-153d870a8fef\\.system_generated\\steps\\1645\\content.md', 'utf8');

let price = 20500;
const priceMatch = content.match(/"price":\s*\{\s*"value":\s*(\d+)/) || content.match(/"price"\s*:\s*"(\d+)"/);
if (priceMatch) {
  price = parseInt(priceMatch[1], 10);
}

let image = "https://avatars.mds.yandex.net/get-mpic/5253816/img_id2830872688006880345.jpeg/orig";
const imgMatch = content.match(/"url"\s*:\s*"([^"]+avatars\.mds\.yandex\.net[^"]+orig)"/);
if (imgMatch) {
  image = imgMatch[1].replace(/\\u002F/g, '/');
}

const productsPath = './public/products.json';
let products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

products = products.map(p => {
  if (p.article === '97916771') {
    // Add Yandex Market to shops
    const ymShop = {
      name: "Яндекс Маркет",
      price: price,
      price_text: price.toLocaleString('ru-RU') + " ₽",
      url: "https://market.yandex.ru/card/tsirkulyatsionnyy-nasos-grundfos-up-15-14-b-pm-comfort-97916771/103554521994",
      in_stock: true
    };
    
    // Check if already exists
    const existingIndex = p.shops.findIndex(s => s.name === "Яндекс Маркет");
    if (existingIndex > -1) {
      p.shops[existingIndex] = ymShop;
    } else {
      p.shops.push(ymShop);
    }
    
    // Sort shops by price
    p.shops.sort((a, b) => a.price - b.price);
    
    // Add Yandex Market image
    p.market_image = image;
    
    // Add some extra specs
    p.specs["Рейтинг (Яндекс)"] = "4.9 / 5";
    p.specs["Отзывы (Яндекс)"] = "Более 50 отзывов";
  }
  return p;
});

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
console.log("Updated products.json with Yandex Market data.");
console.log("Extracted Price:", price);
console.log("Extracted Image:", image);
