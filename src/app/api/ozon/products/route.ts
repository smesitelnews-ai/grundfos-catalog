import { NextResponse } from 'next/server';
import { ozonFetch } from '@/lib/ozon/ozonClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, apiKey } = body;

    if (!clientId || !apiKey) {
      return NextResponse.json({ success: false, error: 'Ключи авторизации не переданы' }, { status: 400 });
    }

    // 1. Получаем статистику (total, active, errors) быстрыми запросами
    const getCount = async (visibility: string) => {
      try {
        const res = await ozonFetch<any>('/v3/product/list', {
          method: 'POST', clientId, apiKey,
          body: { filter: { visibility }, limit: 1 }
        });
        return res?.result?.total || 0;
      } catch {
        return 0;
      }
    };

    const [total, active, errors] = await Promise.all([
      getCount("ALL"),
      getCount("VISIBLE"),
      getCount("STATE_FAILED")
    ]);

    // 2. Получаем только первые 50 товаров для предпросмотра в таблице
    const listResponse = await ozonFetch<any>('/v3/product/list', {
      method: 'POST', clientId, apiKey,
      body: { filter: { visibility: "ALL" }, limit: 50 }
    });

    const items = listResponse?.result?.items || [];
    const productIds = items.map((i: any) => i.product_id);

    let allProducts: any[] = [];
    
    if (productIds.length > 0) {
      try {
        const infoResponse = await ozonFetch<any>('/v3/product/info/list', {
          method: 'POST', clientId, apiKey,
          body: { product_id: productIds }
        });
        allProducts = infoResponse?.result?.items || [];
      } catch (error) {
        console.error(`[Ozon] Ошибка при загрузке деталей товаров:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      products: allProducts,
      stats: { total, active, errors }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Ozon Products Error]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
