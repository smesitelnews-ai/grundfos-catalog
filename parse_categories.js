const fs = require('fs');
const data = JSON.parse(fs.readFileSync('ozon_tree_utf8.json', 'utf8'));

const pumpKeywords = ['насос', 'помп', 'дренаж', 'циркуляцион', 'канализ', 'скважин', 'колодез', 'водоснабж', 'sololift'];

const found = [];

function searchTree(categories, path = '', inPumpCat = false) {
  for (const cat of categories) {
    const name = cat.category_name || cat.type_name;
    const currentPath = path ? `${path} -> ${name}` : name;
    const nameLower = (name || '').toLowerCase();
    
    const isPumpCat = inPumpCat || pumpKeywords.some(kw => nameLower.includes(kw));
    
    if (isPumpCat && !cat.disabled && (!cat.children || cat.children.length === 0)) {
      found.push({
        id: cat.description_category_id || cat.type_id,
        name: name,
        path: currentPath,
        types: cat.type_ids || "leaf"
      });
    }
    
    if (cat.children && cat.children.length > 0) {
      searchTree(cat.children, currentPath, isPumpCat);
    }
  }
}

searchTree(data.result);
console.log(JSON.stringify(found, null, 2));
