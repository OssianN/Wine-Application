/**
 * @jest-environment node
 */
import exploreFixture from '@/__fixtures__/vivinoExploreResponse.json';
import { getVivinoData } from './getVivinoData';
import { mapExploreMatch } from './mapExploreMatch';
import { clearVivinoSessionCache } from './vivinoSession';

const mockHeaders = (cookies: string[] = []) => ({
  getSetCookie: () => cookies,
  get: (name: string) =>
    name.toLowerCase() === 'set-cookie' ? cookies[0] ?? null : null,
});

const mockSwedishSessionFetch = (
  exploreResponse: { ok: true; json: () => Promise<unknown> } | { ok: false; status: number; text: () => Promise<string> }
) =>
  jest.fn(async (input: string | URL | Request) => {
    const url = String(input);
    if (url === 'https://www.vivino.com/sv') {
      return {
        ok: true,
        headers: mockHeaders(['_ruby-web_session=session; Path=/']),
        text: async () =>
          '<meta name="csrf-token" content="test-csrf" />',
      };
    }
    if (url === 'https://www.vivino.com/api/ship_to/') {
      return {
        ok: true,
        headers: mockHeaders([]),
        json: async () => ({ ship_to: { country_code: 'se' } }),
        text: async () => '',
      };
    }
    if (url.startsWith('https://www.vivino.com/api/explore/explore')) {
      return exploreResponse;
    }
    throw new Error(`Unexpected fetch: ${url}`);
  });

describe('mapExploreMatch', () => {
  it('maps the first explore match to scraping fields', () => {
    const result = mapExploreMatch(exploreFixture.explore_vintage.matches[0]);

    expect(result).toEqual({
      img: 'https://images.vivino.com/thumbs/mBgw3aGmRqKQwX9JnSxLDg_pb_300x300.png',
      rating: '4.7',
      country: 'Barolo, Italien',
      vivinoUrl:
        'https://www.vivino.com/SE/sv/giacomo-conterno-barolo-cascina-francia/w/82203?year=2016',
    });
  });

  it('does not map merchant price onto currentPrice', () => {
    const result = mapExploreMatch(exploreFixture.explore_vintage.matches[0]);
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
    delete process.env.VIVINO_FETCH;
    clearVivinoSessionCache();
  });

  it('sets ship-to Sweden then fetches the explore JSON API', async () => {
    const fetchMock = mockSwedishSessionFetch({
      ok: true,
      json: async () => exploreFixture,
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await getVivinoData({
      title: 'Giacomo Conterno Barolo Cascina Francia',
      year: 2016,
    });

    const urls = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(urls[0]).toBe('https://www.vivino.com/sv');
    expect(urls[1]).toBe('https://www.vivino.com/api/ship_to/');
    expect(urls[2]).toContain(
      'https://www.vivino.com/api/explore/explore?'
    );

    const shipToInit = fetchMock.mock.calls[1][1] as RequestInit;
    expect(shipToInit.method).toBe('PUT');
    expect(JSON.parse(String(shipToInit.body))).toEqual({
      country_code: 'se',
      state_code: null,
      zip_code: null,
    });

    expect(urls[2]).toContain(
      'search_term=Giacomo+Conterno+Barolo+Cascina+Francia+2016'
    );
    expect(urls[2]).toContain('country_code=se');
    expect(urls[2]).toContain('language=sv');
    expect(urls[2]).toContain('per_page=1');
    expect(result?.rating).toBe('4.7');
    expect(result?.country).toBe('Barolo, Italien');
    expect(result?.vivinoUrl).toContain('/w/82203?year=2016');
  });

  it('returns undefined when the API has no matches', async () => {
    global.fetch = mockSwedishSessionFetch({
      ok: true,
      json: async () => ({ explore_vintage: { matches: [] } }),
    }) as unknown as typeof fetch;

    await expect(
      getVivinoData({ title: 'Unknown Wine', year: 1999 })
    ).resolves.toBeUndefined();
  });

  it('returns undefined when the API is blocked', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = mockSwedishSessionFetch({
      ok: false,
      status: 403,
      text: async () => 'forbidden',
    }) as unknown as typeof fetch;

    await expect(
      getVivinoData({ title: 'Barolo', year: 2016 })
    ).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('uses Browserless when VIVINO_FETCH=browserless', async () => {
    process.env.VIVINO_FETCH = 'browserless';
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: `
          <a data-testid="wineCard" href="/SE/sv/giacomo-conterno-barolo-cascina-francia/w/82203?year=2016">
            <img data-testid="deferredHiddenImage" src="//images.vivino.com/thumbs/mBgw3aGmRqKQwX9JnSxLDg_pb_300x300.png" />
            <span class="averageValue">4.7</span>
            <span class="regionAndCountry">Barolo, Italien</span>
            <a data-testid="vintagePageLink" href="/SE/sv/giacomo-conterno-barolo-cascina-francia/w/82203?year=2016"></a>
          </a>
        `,
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await getVivinoData({
      title: 'Giacomo Conterno Barolo Cascina Francia',
      year: 2016,
    });

    const requestedUrl = String(fetchMock.mock.calls[0][0]);
    expect(requestedUrl).toContain('production-ams.browserless.io/unblock');
    expect(result?.rating).toBe('4.7');
    expect(result?.country).toBe('Barolo, Italien');
    expect(result?.img).toBe(
      'https://images.vivino.com/thumbs/mBgw3aGmRqKQwX9JnSxLDg_pb_300x300.png'
    );
  });
});
