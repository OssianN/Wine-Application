/**
 * @jest-environment node
 */
import algoliaFixture from '@/__fixtures__/vivinoAlgoliaResponse.json';
import exploreFixture from '@/__fixtures__/vivinoExploreResponse.json';
import pricesFixture from '@/__fixtures__/vivinoPricesResponse.json';
import vintageFixture from '@/__fixtures__/vivinoVintageResponse.json';
import { getVivinoData } from './getVivinoData';
import { mapExploreMatch } from './mapExploreMatch';
import { pickExploreMatch } from './pickExploreMatch';
import { pickVintageId } from './searchAlgolia';
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

const sessionResponse = (url: string) => {
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
  return null;
};

describe('pickVintageId', () => {
  it('picks the vintage that matches the requested year', () => {
    expect(pickVintageId(algoliaFixture.hits[0].vintages, 2016)).toBe(
      156524504
    );
  });
});

describe('pickExploreMatch', () => {
  it('prefers the matching year over the first marketplace card', () => {
    const matches = [
      { vintage: { name: 'Ossian Viñas Viejas Verdejo 2022', year: 2022 } },
      { vintage: { name: 'Quinta do Paral Vinhas Velhas Branco 2019', year: 2019 } },
      { vintage: { name: 'Ossian Viñas Viejas Verdejo 2016', year: 2016 } },
    ];

    expect(
      pickExploreMatch(matches, 'Ossian Viñas Viejas Verdejo', 2016)?.vintage
        ?.year
    ).toBe(2016);
  });
});

describe('mapExploreMatch', () => {
  it('maps a vintage payload to scraping fields', () => {
    const result = mapExploreMatch(vintageFixture);

    expect(result).toEqual({
      img: 'https://images.vivino.com/thumbs/QR0Qn_-GTfe5QCwltBNT-g_pb_300x300.png',
      rating: '4.3',
      country: 'Castilla y León, Spanien',
      vivinoUrl:
        'https://www.vivino.com/SE/sv/ossian-vinas-viejas-verdejo-castilla-and-leon/w/6142915?year=2016',
      vintageId: 156524504,
    });
  });

  it('maps merchant price onto currentPrice', () => {
    const result = mapExploreMatch(exploreFixture.explore_vintage.matches[0]);
    expect(result?.currentPrice).toBe(6503);
    expect(result?.vintageId).toBe(127064316);
  });

  it('skips a non-SEK merchant price', () => {
    const result = mapExploreMatch({
      vintage: exploreFixture.explore_vintage.matches[0].vintage,
      price: { amount: 99, currency: { code: 'EUR' } },
    });
    expect(result).not.toHaveProperty('currentPrice');
  });

  it('returns undefined when there is no vintage', () => {
    expect(mapExploreMatch(undefined)).toBeUndefined();
    expect(mapExploreMatch({})).toBeUndefined();
  });
});

describe('getVivinoData', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    clearVivinoSessionCache();
  });

  it('uses Algolia search then the matching vintage', async () => {
    const fetchMock = jest.fn(
      async (input: string | URL | Request, init?: RequestInit) => {
        const url = String(input);
        const session = sessionResponse(url);
        if (session) return session;
        if (url.includes('algolia.net')) {
          return jsonResponse(algoliaFixture);
        }
        if (url.includes('/api/vintages/156524504')) {
          return jsonResponse(vintageFixture);
        }
        if (url.includes('/api/prices')) {
          return jsonResponse(pricesFixture);
        }
        throw new Error(`Unexpected fetch: ${url} ${init?.method ?? ''}`);
      }
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await getVivinoData({
      title: 'Ossian Viñas Viejas Verdejo',
      year: 2016,
    });

    const urls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(urls[0]).toContain('algolia.net/1/indexes/WINES_prod/query');
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      query: 'Ossian Viñas Viejas Verdejo',
      hitsPerPage: 6,
    });
    expect(urls[1]).toContain('/api/vintages/156524504?language=sv');
    expect(urls.some(url => url.includes('/api/prices?vintage_ids[]=156524504'))).toBe(
      true
    );
    expect(result?.rating).toBe('4.3');
    expect(result?.country).toBe('Castilla y León, Spanien');
    expect(result?.vivinoUrl).toContain('/w/6142915?year=2016');
    expect(result?.currentPrice).toBe(499);
    expect(result?.vintageId).toBe(156524504);
  });

  it('falls back to explore when Algolia has no matching year', async () => {
    const fetchMock = jest.fn(async (input: string | URL | Request) => {
      const url = String(input);
      const session = sessionResponse(url);
      if (session) return session;
      if (url.includes('algolia.net')) {
        return jsonResponse({ hits: [{ id: 1, vintages: [] }] });
      }
      if (url.startsWith('https://www.vivino.com/api/explore/explore')) {
        return jsonResponse(exploreFixture);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await getVivinoData({
      title: 'Giacomo Conterno Barolo Cascina Francia',
      year: 2016,
    });

    const exploreUrl = fetchMock.mock.calls
      .map((call) => String(call[0]))
      .find((url) => url.includes('/api/explore/explore'));
    expect(exploreUrl).toContain('order_by=relevance');
    expect(exploreUrl).toContain('per_page=24');
    expect(result?.vivinoUrl).toContain('/w/82203?year=2016');
    expect(result?.currentPrice).toBe(6503);
  });

  it('returns undefined when explore has no matches', async () => {
    global.fetch = jest.fn(async (input: string | URL | Request) => {
      const url = String(input);
      const session = sessionResponse(url);
      if (session) return session;
      if (url.includes('algolia.net')) {
        return jsonResponse({ hits: [] });
      }
      if (url.startsWith('https://www.vivino.com/api/explore/explore')) {
        return jsonResponse({ explore_vintage: { matches: [] } });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as unknown as typeof fetch;

    await expect(
      getVivinoData({ title: 'Unknown Wine', year: 1999 })
    ).resolves.toBeUndefined();
  });
});
