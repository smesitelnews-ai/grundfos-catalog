import { NextResponse } from 'next/server';
import { ozonFetch } from '@/lib/ozon/ozonClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, apiKey } = body;

    if (!clientId || !apiKey) {
      return NextResponse.json({ success: false, error: 'Ключи авторизации не переданы' }, { status: 400 });
    }

    // Сначала получаем список product_id магазина
    const listResponse = await ozonFetch<any>('/v2/product/list', {
      method: 'POST',
      clientId,
      apiKey,
      body: {
        filter: {
          visibility: "ALL"
        },
        limit: 1000
      }
    });

    const items = listResponse?.result?.items || [];
    const productIds = items.map((i: any) => i.product_id);

    if (productIds.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    // Теперь получаем подробную информацию об этих товарах
    const infoResponse = await ozonFetch<any>('/v2/product/info/list', {
      method: 'POST',
      clientId,
      apiKey,
      body: {
        product_id: productIds
      }
    });

    return NextResponse.json({
      success: true,
      products: infoResponse?.result?.items || []
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Ozon Products Error]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
