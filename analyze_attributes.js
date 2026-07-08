const fs = require('fs');
const data = JSON.parse(fs.readFileSync('ozon_attributes_circ.json', 'utf8'));

const required = [];
const optional = [];

for (const attr of data.result) {
  const item = {
    id: attr.id,
    name: attr.name,
    type: attr.type,
    is_collection: attr.is_collection,
    dictionary_id: attr.dictionary_id
  };
  if (attr.is_required) {
    required.push(item);
  } else {
    optional.push(item);
  }
}

console.log("=== REQUIRED ATTRIBUTES ===");
console.log(JSON.stringify(required, null, 2));

console.log("\n=== SOME OPTIONAL ATTRIBUTES ===");
console.log(JSON.stringify(optional.slice(0, 5), null, 2));
