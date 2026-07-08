// HTTP-клиент для работы с Ozon Seller API
// Документация: https://docs.ozon.ru/api/seller/

const OZON_API_BASE = 'https://api-seller.ozon.ru';

interface OzonRequestOptions {
  method?: 'GET' | 'POST';
  body?: Record<string, unknown>;
  clientId?: string;
  apiKey?: string;
}

/**
 * Выполняет запрос к Ozon Seller API.
 * Заголовки Client-Id и Api-Key могут быть переданы явно или браться из переменных окружения.
 */
export async function ozonFetch<T = unknown>(
  endpoint: string,
  options: OzonRequestOptions = {}
): Promise<T> {
  const clientId = options.clientId || process.env.OZON_CLIENT_ID;
  const apiKey = options.apiKey || process.env.OZON_API_KEY;

  if (!clientId || !apiKey) {
    throw new Error(
      'Не заданы ключи авторизации Client-Id и Api-Key.'
    );
  }

  const { method = 'POST', body } = options;

  const url = `${OZON_API_BASE}${endpoint}`;
  console.log(`[OzonAPI] ${method} ${url}`);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Client-Id': clientId,
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[OzonAPI] Ошибка ${response.status}:`, errorText);
      throw new Error(
        `Ozon API ошибка ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    console.log(`[OzonAPI] Успех: ${endpoint}`);
    return data as T;
  } catch (error: unknown) {
    if (error instanceof TypeError && (error as any).cause) {
      // Сетевая ошибка (DNS, SSL, timeout)
      console.error(`[OzonAPI] Сетевая ошибка:`, (error as any).cause);
      throw new Error(
        `Сетевая ошибка при подключении к Ozon API: ${(error as any).cause?.message || error.message}`
      );
    }
    throw error;
  }
}

/**
 * Выполняет прямой запрос к Ozon Seller API из браузера (CORS поддерживается Ozon).
 * Это позволяет избежать таймаутов (10s) и блокировок IP от серверов Vercel.
 */
export async function browserOzonFetch<T = unknown>(
  endpoint: string,
  options: OzonRequestOptions
): Promise<T> {
  const { clientId, apiKey, method = 'POST', body } = options;

  if (!clientId || !apiKey) {
    throw new Error('Не заданы ключи авторизации Client-Id и Api-Key.');
  }

  const url = `${OZON_API_BASE}${endpoint}`;
  console.log(`[Browser OzonAPI] ${method} ${url}`);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Client-Id': clientId,
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Browser OzonAPI] Ошибка ${response.status}:`, errorText);
      throw new Error(`Ozon API ошибка ${response.status}: ${errorText}`);
    }

    return await response.json() as T;
  } catch (error: any) {
    console.error(`[Browser OzonAPI] Сетевая ошибка:`, error);
    throw new Error(`Сетевая ошибка при подключении к Ozon API: ${error.message}`);
  }
}
