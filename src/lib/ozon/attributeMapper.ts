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

export function mapProductToOzonAttributes(product: any, categoryName: string, settings?: any) {
  const attributes = [];

  // 1. Бренд (ID: 85, словарь Ozon: 28732849)
  attributes.push({
    id: 85,
    values: [{ value: "Grundfos" }]
  });

  // 2. Тип (ID: 8229)
  attributes.push({
    id: 8229,
    values: [{ value: categoryName || "Циркуляционный насос" }]
  });

  // 3. Название модели (ID: 9048)
  if (!settings || settings.exportDescription) {
    attributes.push({
      id: 9048,
      values: [{ value: product.name }]
    });
  }

  // 4. ТН ВЭД коды ЕАЭС (ID: 22232)
  attributes.push({
    id: 22232,
    values: [{ value: "8413703000" }]
  });

  // 5. Нужен код маркировки (ID: 23536)
  attributes.push({
    id: 23536,
    values: [{ value: "false" }]
  });

  // Дополнительные атрибуты, если они есть
  if (!settings || settings.exportSpecs) {
    const specs = product.specs || {};
    const specsList = settings?.specsList || {};

    // Производительность, л/мин (ID: 7454)
    // Смотрим, разрешена ли выгрузка "Максимальный расход"
    if (specs["Максимальный расход"] && specsList["Максимальный расход"] !== false) {
      const match = specs["Максимальный расход"].match(/[\d.,]+/);
      if (match) {
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
    if (specs["Монтажная длина"] && specsList["Монтажная длина"] !== false) {
      const match = specs["Монтажная длина"].match(/[\d.,]+/);
      if (match) {
        attributes.push({
          id: 20980,
          values: [{ value: match[0] }]
        });
      }
    }
    
    // В будущем здесь можно добавить обработку других характеристик (Тип насоса, Рабочее давление и т.д.)
    // привязывая их к соответствующим ID атрибутов в Ozon
  }

  return attributes;
}
