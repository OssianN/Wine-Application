/**
 * @jest-environment node
 */
import checkoutFixture from '@/__fixtures__/vivinoCheckoutPricesResponse.json';
import pricesFixture from '@/__fixtures__/vivinoPricesResponse.json';
import substituteFixture from '@/__fixtures__/vivinoPricesSubstituteResponse.json';
import { vivinoWineIdFromUrl } from '@/lib/utils';
import {
  getVivinoPriceForVintage,
  getVivinoPriceForWineYear,
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

  it('returns null when Vivino substitutes a sibling vintage', async () => {
    mockVivinoFetches(url => {
      if (url.includes('/api/prices')) {
        return jsonResponse(substituteFixture);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    await expect(getVivinoPriceForVintage(156524504)).resolves.toBeNull();
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

  it('returns null when that year is not listed', async () => {
    mockVivinoFetches(url => {
      if (url.includes('/checkout_prices')) {
        return jsonResponse(checkoutFixture);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    await expect(getVivinoPriceForWineYear(82203, 2010)).resolves.toBeNull();
  });
});
