// Маппер для преобразования наших товаров в формат атрибутов Ozon
// Согласно документации Ozon, нам нужно передавать attributes.

export function generateEan13(article: string): string {
  // Для внутренних тестов сгенерируем валидный EAN-13, начинающийся на "200" (внутренние штрихкоды)
  // В идеале использовать реальный штрихкод
  let base = '200' + article.padStart(9, '0').slice(-9);
  
  // Расчет контрольной суммы EAN-13
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(base[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return base + checkDigit;
}

export function mapProductToOzonAttributes(product: any, categoryName: string) {
  const attributes = [];

  // 1. Бренд (ID: 85, словарь Ozon: 28732849)
  // Ozon требует передавать value или dictionary_value_id.
  // Мы попробуем передать value как строку "Grundfos", так как dictionary_value_id нужно искать через API словарей.
  attributes.push({
    id: 85,
    values: [
      {
        dictionary_value_id: 28732849, // Если мы точно знаем ID "Grundfos" в Ozon (это пример, возможно другой)
        // Для безопасности лучше использовать просто value, Ozon часто принимает текстом
        value: "Grundfos" 
      }
    ]
  });

  // 2. Тип (ID: 8229)
  attributes.push({
    id: 8229,
    values: [
      {
        value: categoryName || "Циркуляционный насос"
      }
    ]
  });

  // 3. Название модели (ID: 9048)
  attributes.push({
    id: 9048,
    values: [
      {
        value: product.name
      }
    ]
  });

  // 4. ТН ВЭД коды ЕАЭС (ID: 22232)
  // 8413703000 - пример кода для насосов циркуляционных
  attributes.push({
    id: 22232,
    values: [
      {
        value: "8413703000"
      }
    ]
  });

  // 5. Нужен код маркировки (ID: 23536)
  attributes.push({
    id: 23536,
    values: [
      {
        value: "false"
      }
    ]
  });

  // Дополнительные атрибуты, если они есть
  const specs = product.specs || {};

  // Производительность, л/мин (ID: 7454)
  if (specs["Максимальный расход"]) {
    // Попытка извлечь число
    const match = specs["Максимальный расход"].match(/[\d.,]+/);
    if (match) {
      // Преобразуем м3/ч в л/мин примерно (1 м3/ч = 16.6 л/мин)
      const m3h = parseFloat(match[0].replace(',', '.'));
      const lmin = Math.round(m3h * 16.6667);
      if (lmin > 0) {
        attributes.push({
          id: 7454,
          values: [{ value: String(lmin) }]
        });
      }
    }
  }

  // Монтажная длина, мм (ID: 20980)
  if (specs["Монтажная длина"]) {
    const match = specs["Монтажная длина"].match(/[\d.,]+/);
    if (match) {
      attributes.push({
        id: 20980,
        values: [{ value: match[0] }]
      });
    }
  }

  return attributes;
}
