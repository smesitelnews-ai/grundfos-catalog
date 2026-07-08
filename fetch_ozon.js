const fs = require('fs');

async function fetchCategories() {
  const clientId = '758438';
  const apiKey = '2d963f92-13a6-433f-bf97-702033b3e5a0';
  
  const response = await fetch('https://api-seller.ozon.ru/v1/description-category/tree', {
    method: 'POST',
    headers: {
      'Client-Id': clientId,
      'Api-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ language: "DEFAULT" })
  });

  const data = await response.json();
  fs.writeFileSync('ozon_tree_utf8.json', JSON.stringify(data, null, 2), 'utf8');
  console.log("Tree saved. Root elements:", data.result.length);
}

fetchCategories();
