/**
 * @jest-environment node
 */

process.env.MONGODB_URI ??= 'mongodb://localhost:27017/test';

import { titleYearWineLibrary } from '@/__fixtures__/titleYearWineLibrary';
import vintageFixture from '@/__fixtures__/vivinoVintageResponse.json';
import { getUserSession } from '@/lib/session';
import { getUserWine } from '@/mongoDB/getUserWine';
import { stampVivinoLibraryRefresh } from '@/mongoDB/stampVivinoLibraryRefresh';
import { bulkUpdateVivinoDetailsInDb } from '@/mongoDB/updateVivinoDetailsInDb';
import { revalidatePath } from 'next/cache';
import { POST } from '@/app/api/refreshVivinoDetails/route';
import { clearVivinoSessionCache } from '@/scraping/vivinoSession';

jest.mock('@/lib/session', () => ({
  getUserSession: jest.fn(),
}));
jest.mock('@/mongoDB', () => ({
  connectMongo: jest.fn(),
}));
jest.mock('@/mongoDB/getUserWine', () => ({
  getUserWine: jest.fn(),
}));
jest.mock('@/mongoDB/stampVivinoLibraryRefresh', () => ({
  stampVivinoLibraryRefresh: jest.fn(),
  getVivinoLibraryRefreshedAt: jest.fn(),
}));
jest.mock('@/mongoDB/updateVivinoDetailsInDb', () => ({
  bulkUpdateVivinoDetailsInDb: jest.fn(),
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const mockGetUserSession = getUserSession as jest.MockedFunction<
  typeof getUserSession
>;
const mockGetUserWine = getUserWine as jest.MockedFunction<typeof getUserWine>;
const mockStamp = stampVivinoLibraryRefresh as jest.MockedFunction<
  typeof stampVivinoLibraryRefresh
>;
const mockBulkUpdate = bulkUpdateVivinoDetailsInDb as jest.MockedFunction<
  typeof bulkUpdateVivinoDetailsInDb
>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<
  typeof revalidatePath
>;

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

const vintageIdForWine = (index: number) => 3_000_000 + index;
const priceForWine = (index: number) => 120 + index;

const libraryByTitle = new Map(
  titleYearWineLibrary.map((wine, index) => [wine.title, { wine, index }])
);

const mockTitleYearVivinoFetches = () => {
  global.fetch = jest.fn(async (input: string | URL | Request, init?: RequestInit) => {
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
    if (url.includes('algolia.net')) {
      const body = JSON.parse(String(init?.body ?? '{}')) as { query?: string };
      const match = libraryByTitle.get(body.query ?? '');
      if (!match) return jsonResponse({ hits: [] });
      return jsonResponse({
        hits: [
          {
            id: 8_000_000 + match.index,
            name: match.wine.title,
            vintages: [
              {
                id: vintageIdForWine(match.index),
                year: String(match.wine.year),
                name: `${match.wine.title} ${match.wine.year}`,
              },
            ],
          },
        ],
      });
    }
    if (url.includes('/api/prices')) {
      const vintageIds = [...url.matchAll(/vintage_ids\[\]=(\d+)/g)].map(item =>
        item[1]
      );
      const vintages = Object.fromEntries(
        vintageIds.map(id => {
          const index = Number(id) - 3_000_000;
          return [
            id,
            {
              vintage: { id: Number(id), year: titleYearWineLibrary[index]?.year },
              price: { amount: priceForWine(index) },
            },
          ];
        })
      );
      return jsonResponse({
        prices: {
          market: { currency: { code: 'SEK' } },
          vintages,
        },
      });
    }
    const vintageMatch = url.match(/\/api\/vintages\/(\d+)/);
    if (vintageMatch) {
      const vintageId = Number(vintageMatch[1]);
      const index = vintageId - 3_000_000;
      const wine = titleYearWineLibrary[index];
      return jsonResponse({
        ...vintageFixture,
        vintage: {
          ...vintageFixture.vintage,
          id: vintageId,
          year: wine?.year,
          name: `${wine?.title ?? 'Unknown'} ${wine?.year ?? ''}`.trim(),
          recommended_drinking_window: {
            start_year: (wine?.year ?? 2000) + 2,
            end_year: (wine?.year ?? 2000) + 12,
            status: 5,
          },
        },
      });
    }
    throw new Error(`Unexpected fetch: ${url}`);
  }) as unknown as typeof fetch;
};

describe('bulk update e2e: 60 title-and-year wines', () => {
  const originalFetch = global.fetch;
  const nextAvailableAt = new Date('2026-10-14T12:00:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();
    clearVivinoSessionCache();
    mockTitleYearVivinoFetches();
    mockGetUserSession.mockResolvedValue({
      user: { _id: 'user-1' },
    } as Awaited<ReturnType<typeof getUserSession>>);
    mockStamp.mockResolvedValue({
      ok: true,
      refreshedAt: new Date('2026-09-14T12:00:00.000Z'),
      nextAvailableAt,
    });
    mockGetUserWine.mockResolvedValue(titleYearWineLibrary as never);
    mockBulkUpdate.mockResolvedValue(undefined);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    clearVivinoSessionCache();
  });

  it('has a cellar of 60 wines with only title and year', () => {
    expect(titleYearWineLibrary).toHaveLength(60);
    expect(
      titleYearWineLibrary.every(
        wine =>
          Object.keys(wine).sort().join() === '_id,title,year' &&
          typeof wine.title === 'string' &&
          wine.title.length > 0 &&
          Number.isInteger(wine.year)
      )
    ).toBe(true);
  });

  it('refreshes price and drinking window for every title-and-year wine', async () => {
    const response = await POST();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      updated: 60,
      skipped: 0,
      failed: 0,
      nextAvailableAt: nextAvailableAt.toISOString(),
    });

    expect(mockGetUserWine).toHaveBeenCalledWith({ _id: 'user-1' });
    expect(mockStamp).toHaveBeenCalledWith('user-1');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(mockBulkUpdate).toHaveBeenCalledTimes(1);

    const updates = mockBulkUpdate.mock.calls[0][0];
    expect(updates).toHaveLength(60);
    expect(updates.map(update => update.wineId)).toEqual(
      titleYearWineLibrary.map(wine => wine._id)
    );

    updates.forEach((update, index) => {
      const wine = titleYearWineLibrary[index];
      expect(update).toEqual({
        wineId: wine._id,
        currentPrice: priceForWine(index),
        vintageId: vintageIdForWine(index),
        drinkingWindowStart: wine.year + 2,
        drinkingWindowEnd: wine.year + 12,
        drinkingWindowStatus: 5,
      });
    });

    const urls = (global.fetch as jest.Mock).mock.calls.map(call =>
      String(call[0])
    );
    expect(urls.filter(url => url.includes('algolia.net'))).toHaveLength(60);
    expect(urls.filter(url => url.includes('/api/prices'))).toHaveLength(60);
    expect(urls.filter(url => url.includes('/api/vintages/'))).toHaveLength(60);
    expect(urls.filter(url => url.includes('/checkout_prices'))).toHaveLength(0);
  }, 20000);
});
