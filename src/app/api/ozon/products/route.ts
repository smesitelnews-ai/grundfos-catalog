import { NextResponse } from 'next/server';
import { ozonFetch } from '@/lib/ozon/ozonClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, apiKey } = body;

    if (!clientId || !apiKey) {
      return NextResponse.json({ success: false, error: 'Ключи авторизации не переданы' }, { status: 400 });
    }

    // 1. Получаем все product_id с учетом пагинации
    let allProductIds: number[] = [];
    let lastId = "";
    let hasMore = true;

    while (hasMore) {
      const listResponse = await ozonFetch<any>('/v3/product/list', {
        method: 'POST',
        clientId,
        apiKey,
        body: {
          filter: { visibility: "ALL" },
          limit: 1000,
          last_id: lastId
        }
      });

      const items = listResponse?.result?.items || [];
      const productIds = items.map((i: any) => i.product_id);
      allProductIds = [...allProductIds, ...productIds];

      lastId = listResponse?.result?.last_id || "";
      hasMore = items.length === 1000 && lastId !== "";
    }

    if (allProductIds.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    // 2. Получаем подробную информацию безопасными чанками
    let allProducts: any[] = [];

    const fetchInfoForIds = async (ids: number[], currentChunkSize: number) => {
      for (let i = 0; i < ids.length; i += currentChunkSize) {
        const chunk = ids.slice(i, i + currentChunkSize);
        try {
          const infoResponse = await ozonFetch<any>('/v3/product/info/list', {
            method: 'POST',
            clientId,
            apiKey,
            body: { product_id: chunk }
          });
          const chunkItems = infoResponse?.result?.items || [];
          
          if (chunkItems.length === 0 && chunk.length > 1) {
            // Если Озон не вернул ничего (ошибка внутри чанка), дробим чанк на более мелкие
            console.warn(`[Ozon] Чанк из ${chunk.length} товаров пуст. Пробуем уменьшить размер...`);
            const smallerChunkSize = Math.max(1, Math.floor(currentChunkSize / 10));
            await fetchInfoForIds(chunk, smallerChunkSize);
          } else {
            allProducts = [...allProducts, ...chunkItems];
          }
        } catch (error) {
           console.error(`[Ozon] Ошибка при загрузке чанка из ${chunk.length} товаров`, error);
        }
      }
    };

    // Стартуем с размера чанка 100
    await fetchInfoForIds(allProductIds, 100);

    return NextResponse.json({
      success: true,
      products: allProducts
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Ozon Products Error]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
