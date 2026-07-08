import { NextResponse } from 'next/server';
import { ozonFetch } from '@/lib/ozon/ozonClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, apiKey, productId } = body;

    if (!clientId || !apiKey || !productId) {
      return NextResponse.json({ success: false, error: 'Ключи авторизации или ID товара не переданы' }, { status: 400 });
    }

    const response = await ozonFetch<any>('/v3/products/info/attributes', {
      method: 'POST',
      clientId,
      apiKey,
      body: { filter: { product_id: [productId] }, limit: 1 }
    });

    if (response?.result && response.result.length > 0) {
      return NextResponse.json({ success: true, attributes: response.result[0] });
    }

    return NextResponse.json({ success: true, attributes: null });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Ozon Attributes Error]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
