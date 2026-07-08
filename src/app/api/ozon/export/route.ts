import { NextResponse } from 'next/server';
import { ozonFetch } from '@/lib/ozon/ozonClient';
import { mapProductToOzonAttributes, generateEan13 } from '@/lib/ozon/attributeMapper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { products, vat = "0.2", clientId, apiKey, settings } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ success: false, error: 'Массив товаров пуст или не передан' }, { status: 400 });
    }

    const defaultSettings = {
      exportDescription: true,
      exportImages: true,
      exportPrice: true,
      exportBarcode: true,
      exportSpecs: true,
      specsList: {}
    };

    const s = settings || defaultSettings;

    // Подготовка товаров к отправке на Ozon
    const items = products.map((product: any) => {
      // Ищем категорию Ozon на основе типа насоса. По умолчанию берем циркуляционный.
      let typeId = 98340; // Насос поверхностный
      let ozonCategoryName = "Насос поверхностный";
      
      const pumpType = product.specs?.["Тип насоса"]?.toLowerCase() || "";
      if (pumpType.includes("погружной") || pumpType.includes("дренажный") || pumpType.includes("скважинный")) {
        typeId = 91462;
        ozonCategoryName = "Насос погружной";
      } else if (pumpType.includes("станция")) {
        typeId = 91468;
        ozonCategoryName = "Насосная станция";
      }

      // Габариты (по умолчанию, если нет)
      const depth = 30;
      const width = 20;
      const height = 20;
      const weight = 5;

      // Формируем URL изображения (должен быть абсолютным)
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grundfos-catalog-demo.vercel.app";
      const primaryImage = product.image ? (product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`) : undefined;

      const item: any = {
        description_category_id: 83625738, // Насосы для дачи
        name: `Насос ${product.name}`,
        offer_id: product.article,
        vat: vat,
        currency_code: "RUB",
        depth,
        width,
        height,
        dimension_unit: "cm",
        weight,
        weight_unit: "kg",
        attributes: mapProductToOzonAttributes(product, ozonCategoryName, s),
        complex_attributes: []
      };

      if (s.exportPrice) {
        item.price = String(product.our_price || product.min_price || 10000);
      } else {
        item.price = "0"; // Ozon might require a price, but if disabled we can send 0 or skip it if allowed
      }

      if (s.exportBarcode) {
        item.barcode = product.barcode || generateEan13(product.article);
      }

      if (s.exportImages && primaryImage) {
        item.primary_image = primaryImage;
        item.images = [primaryImage];
      } else {
        item.primary_image = "";
        item.images = [];
      }

      return item;
    });

    // Отправляем на Ozon
    console.log(`[Ozon Export] Отправка ${items.length} товаров на Ozon...`);
    
    // Ozon принимает до 100 товаров в одном запросе
    const response = await ozonFetch<any>('/v3/product/import', {
      method: 'POST',
      body: { items },
      clientId,
      apiKey
    });

    return NextResponse.json({
      success: true,
      task_id: response.result?.task_id,
      message: `Задание на импорт успешно создано. Task ID: ${response.result?.task_id}`
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Ozon Export Error]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
