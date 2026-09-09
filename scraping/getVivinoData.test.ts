/**
 * @jest-environment node
 */
import exploreFixture from '@/__fixtures__/vivinoExploreResponse.json';
import { getVivinoData, mapExploreMatch } from './getVivinoData';

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
  });

  it('fetches the explore JSON API and returns the first match', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => exploreFixture,
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await getVivinoData({
      title: 'Giacomo Conterno Barolo Cascina Francia',
      year: 2016,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestedUrl = String(fetchMock.mock.calls[0][0]);
    expect(requestedUrl).toContain(
      'https://www.vivino.com/api/explore/explore?'
    );
    expect(requestedUrl).toContain(
      'search_term=Giacomo+Conterno+Barolo+Cascina+Francia+2016'
    );
    expect(requestedUrl).toContain('country_code=se');
    expect(requestedUrl).toContain('per_page=1');
    expect(result?.rating).toBe('4.7');
    expect(result?.country).toBe('Barolo, Italien');
    expect(result?.vivinoUrl).toContain('/w/82203?year=2016');
  });

  it('returns undefined when the API has no matches', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ explore_vintage: { matches: [] } }),
    }) as unknown as typeof fetch;

    await expect(
      getVivinoData({ title: 'Unknown Wine', year: 1999 })
    ).resolves.toBeUndefined();
  });

  it('returns undefined when the API is blocked', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn().mockResolvedValue({
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
