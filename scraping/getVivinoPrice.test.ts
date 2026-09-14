/**
 * @jest-environment node
 */
import checkoutFixture from '@/__fixtures__/vivinoCheckoutPricesResponse.json';
import pricesFixture from '@/__fixtures__/vivinoPricesResponse.json';
import substituteFixture from '@/__fixtures__/vivinoPricesSubstituteResponse.json';
import { vivinoVintageIdFromUrl, vivinoWineIdFromUrl } from '@/lib/utils';
import {
  getCheckoutForWineYear,
  getVivinoPriceForVintage,
  getVivinoPriceForWineYear,
  getVivinoPricesForVintages,
  toSekAmount,
} from './getVivinoPrice';
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

describe('toSekAmount', () => {
  it('rounds a positive SEK amount', () => {
    expect(toSekAmount(6503.4, 'SEK')).toBe(6503);
  });

  it('rejects a non-SEK currency', () => {
    expect(toSekAmount(12, 'EUR')).toBeNull();
  });
});

describe('vivinoWineIdFromUrl', () => {
  it('reads the wine id from a wine page URL', () => {
    expect(
      vivinoWineIdFromUrl(
        'https://www.vivino.com/SE/sv/ossian-vinas-viejas-verdejo-castilla-and-leon/w/6142915?year=2016'
      )
    ).toBe(6142915);
  });

  it('returns null when the URL has no wine id', () => {
    expect(
      vivinoWineIdFromUrl('https://www.vivino.com/SE/sv/wines/156524504')
    ).toBeNull();
  });
});

describe('vivinoVintageIdFromUrl', () => {
  it('reads the vintage id from a wines URL', () => {
    expect(
      vivinoVintageIdFromUrl('https://www.vivino.com/SE/sv/wines/156524504')
    ).toBe(156524504);
  });

  it('returns null when the URL has no vintage id', () => {
    expect(
      vivinoVintageIdFromUrl(
        'https://www.vivino.com/SE/sv/ossian-vinas-viejas-verdejo-castilla-and-leon/w/6142915?year=2016'
      )
    ).toBeNull();
  });
});

describe('getVivinoPriceForVintage', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    clearVivinoSessionCache();
  });

  it('returns the SEK listing when the vintage id matches', async () => {
    mockVivinoFetches(url => {
      if (url.includes('/api/prices')) {
        return jsonResponse(pricesFixture);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    await expect(getVivinoPriceForVintage(156524504)).resolves.toBe(499);
  });

  it('uses the market listing when Vivino substitutes a sibling vintage', async () => {
    mockVivinoFetches(url => {
      if (url.includes('/api/prices')) {
        return jsonResponse(substituteFixture);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    await expect(getVivinoPriceForVintage(156524504)).resolves.toBe(559);
  });
});

describe('getVivinoPricesForVintages', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    clearVivinoSessionCache();
  });

  it('maps several vintage ids from one prices API call', async () => {
    mockVivinoFetches(url => {
      if (url.includes('/api/prices')) {
        return jsonResponse({
          prices: {
            market: { currency: { code: 'SEK' } },
            vintages: {
              '156524504': { price: { amount: 499 } },
              '127064316': { median: { amount: 6503.4 } },
            },
          },
        });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const prices = await getVivinoPricesForVintages([156524504, 127064316]);
    expect(prices.get(156524504)).toBe(499);
    expect(prices.get(127064316)).toBe(6503);

    const priceUrls = (global.fetch as jest.Mock).mock.calls
      .map(call => String(call[0]))
      .filter(url => url.includes('/api/prices'));
    expect(priceUrls).toHaveLength(1);
    expect(priceUrls[0]).toContain('vintage_ids[]=156524504');
    expect(priceUrls[0]).toContain('vintage_ids[]=127064316');
  });

  it('does not fetch when there are no valid vintage ids', async () => {
    mockVivinoFetches(() => {
      throw new Error('Unexpected fetch');
    });

    await expect(getVivinoPricesForVintages([0, -1])).resolves.toEqual(new Map());
    const priceUrls = (global.fetch as jest.Mock).mock.calls
      .map(call => String(call[0]))
      .filter(url => url.includes('/api/prices'));
    expect(priceUrls).toHaveLength(0);
  });
});

describe('getVivinoPriceForWineYear', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    clearVivinoSessionCache();
  });

  it('picks the checkout listing for the requested year', async () => {
    mockVivinoFetches(url => {
      if (url.includes('/checkout_prices')) {
        return jsonResponse(checkoutFixture);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    await expect(getVivinoPriceForWineYear(82203, 2016)).resolves.toBe(6503);
  });

  it('falls back to the closest listed year', async () => {
    mockVivinoFetches(url => {
      if (url.includes('/checkout_prices')) {
        return jsonResponse(checkoutFixture);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    await expect(getVivinoPriceForWineYear(82203, 2010)).resolves.toBe(6503);
  });
});

describe('getCheckoutForWineYear', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    clearVivinoSessionCache();
  });

  it('returns price and vintage id for the requested year', async () => {
    mockVivinoFetches(url => {
      if (url.includes('/checkout_prices')) {
        return jsonResponse(checkoutFixture);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    await expect(getCheckoutForWineYear(82203, 2016)).resolves.toEqual({
      price: 6503,
      vintageId: 127064316,
    });
  });

  it('keeps a closest-year price but no vintage id when the year is missing', async () => {
    mockVivinoFetches(url => {
      if (url.includes('/checkout_prices')) {
        return jsonResponse(checkoutFixture);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    await expect(getCheckoutForWineYear(82203, 2010)).resolves.toEqual({
      price: 6503,
      vintageId: null,
    });
  });
});
