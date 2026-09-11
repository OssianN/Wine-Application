/**
 * @jest-environment node
 */
import algoliaFixture from '@/__fixtures__/vivinoAlgoliaResponse.json';
import checkoutFixture from '@/__fixtures__/vivinoCheckoutPricesResponse.json';
import vintageFixture from '@/__fixtures__/vivinoVintageResponse.json';
import { getVivinoDetailsForWine } from './getVivinoDetails';
import { clearVivinoSessionCache } from './vivinoSession';

const mockHeaders = (cookies: string[] = []) => ({
  getSetCookie: () => cookies,
  get: (name: string) =>
    name.toLowerCase() === 'set-cookie' ? cookies[0] ?? null : null,
});

const jsonResponse = (body: unknown, cookies: string[] = []) => ({
  ok: true as const,
  headers: mockHeaders(cookies),
  json: async () => body,
  text: async (): Promise<string> => JSON.stringify(body),
});

const mockVivinoFetches = (
  handlers: (url: string) => ReturnType<typeof jsonResponse>
) => {
  global.fetch = jest.fn(async (input: string | URL | Request) => {
    const url = String(input);
    if (url === 'https://www.vivino.com/api/countries') {
      return jsonResponse({ countries: [] }, [
        'csrf_token=test-csrf; Path=/',
        '_ruby-web_session=session; Path=/',
      ]);
    }
    if (url === 'https://www.vivino.com/api/ship_to/') {
      return jsonResponse({ ship_to: { country_code: 'se' } }, [
        'ship_to=se; Path=/',
        'csrf_token=test-csrf; Path=/',
      ]);
    }
    return handlers(url);
  }) as unknown as typeof fetch;
};

describe('getVivinoDetailsForWine', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    clearVivinoSessionCache();
  });

  it('loads price and drinking window from one checkout call', async () => {
    mockVivinoFetches(url => {
      if (url.includes('/checkout_prices')) {
        return jsonResponse(checkoutFixture);
      }
      if (url.includes('/api/vintages/127064316')) {
        return jsonResponse(vintageFixture);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    await expect(
      getVivinoDetailsForWine({ wineId: 82203, year: 2016 })
    ).resolves.toEqual({
      price: 6503,
      vintageId: 127064316,
      drinkingWindowStart: 2018,
      drinkingWindowEnd: 2024,
      drinkingWindowStatus: 5,
    });

    const urls = (global.fetch as jest.Mock).mock.calls.map(call =>
      String(call[0])
    );
    expect(urls.filter(url => url.includes('/checkout_prices'))).toHaveLength(1);
  });

  it('falls back to Algolia for a vintage id when checkout has no matching year', async () => {
    mockVivinoFetches(url => {
      if (url.includes('/checkout_prices')) {
        return jsonResponse({ checkout_prices: [] });
      }
      if (url.includes('algolia.net')) {
        return jsonResponse(algoliaFixture);
      }
      if (url.includes('/api/prices')) {
        return jsonResponse({ prices: {} });
      }
      if (url.includes('/api/vintages/156524504')) {
        return jsonResponse(vintageFixture);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    await expect(
      getVivinoDetailsForWine({
        wineId: 6142915,
        year: 2016,
        title: 'Ossian Viñas Viejas Verdejo',
      })
    ).resolves.toMatchObject({
      vintageId: 156524504,
      drinkingWindowStart: 2018,
      drinkingWindowEnd: 2024,
      drinkingWindowStatus: 5,
    });
  });
});
