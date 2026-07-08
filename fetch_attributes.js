const fs = require('fs');

async function fetchAttributes() {
  const clientId = '758438';
  const apiKey = '2d963f92-13a6-433f-bf97-702033b3e5a0';
  
  const response = await fetch('https://api-seller.ozon.ru/v1/description-category/attribute', {
    method: 'POST',
    headers: {
      'Client-Id': clientId,
      'Api-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description_category_id: 83625738,
      type_id: 98340,
      language: "DEFAULT"
    })
  });

  const data = await response.json();
  fs.writeFileSync('ozon_attributes_circ.json', JSON.stringify(data, null, 2), 'utf8');
  console.log("Attributes saved. Result count:", data.result ? data.result.length : "error");
}

fetchAttributes();
