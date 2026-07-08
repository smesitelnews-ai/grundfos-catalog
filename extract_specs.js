const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/products.json', 'utf8'));

const specsKeys = new Set();
data.forEach(item => {
  if (item.specs) {
    Object.keys(item.specs).forEach(key => specsKeys.add(key));
  }
});

console.log(Array.from(specsKeys));
