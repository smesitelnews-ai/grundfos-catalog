// HTTP-клиент для работы с Ozon Seller API
// Документация: https://docs.ozon.ru/api/seller/

const OZON_API_BASE = 'https://api-seller.ozon.ru';

interface OzonRequestOptions {
  method?: 'GET' | 'POST';
  body?: Record<string, unknown>;
}

/**
 * Выполняет запрос к Ozon Seller API с автоматической авторизацией.
 * Заголовки Client-Id и Api-Key берутся из переменных окружения.
 */
export async function ozonFetch<T = unknown>(
  endpoint: string,
  options: OzonRequestOptions = {}
): Promise<T> {
  const clientId = process.env.OZON_CLIENT_ID;
  const apiKey = process.env.OZON_API_KEY;

  if (!clientId || !apiKey) {
    throw new Error(
      'Не заданы переменные окружения OZON_CLIENT_ID и OZON_API_KEY. ' +
      'Добавьте их в файл .env.local'
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
