/**
 * @jest-environment node
 */

process.env.MONGODB_URI ??= 'mongodb://localhost:27017/test';

import { getUserSession } from '@/lib/session';
import { getUserWine } from '@/mongoDB/getUserWine';
import {
  getVivinoLibraryRefreshedAt,
  stampVivinoLibraryRefresh,
} from '@/mongoDB/stampVivinoLibraryRefresh';
import { bulkUpdateVivinoDetailsInDb } from '@/mongoDB/updateVivinoDetailsInDb';
import { refreshVivinoDetailsForWines } from '@/scraping/refreshVivinoDetailsForWines';
import { nextVivinoLibraryRefreshAt } from '@/lib/vivinoLibraryRefresh';
import { bulkUpdateVivinoDetailsInDb } from '@/mongoDB/updateVivinoDetailsInDb';
import { refreshVivinoDetailsForWines } from '@/scraping/refreshVivinoDetailsForWines';
import { revalidatePath } from 'next/cache';
import { GET, POST } from './route';

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
jest.mock('@/scraping/refreshVivinoDetailsForWines', () => ({
  refreshVivinoDetailsForWines: jest.fn(),
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
const mockGetRefreshedAt = getVivinoLibraryRefreshedAt as jest.MockedFunction<
  typeof getVivinoLibraryRefreshedAt
>;
const mockBulkUpdate = bulkUpdateVivinoDetailsInDb as jest.MockedFunction<
  typeof bulkUpdateVivinoDetailsInDb
>;
const mockRefresh = refreshVivinoDetailsForWines as jest.MockedFunction<
  typeof refreshVivinoDetailsForWines
>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<
  typeof revalidatePath
>;

const nextAvailableAt = new Date('2026-10-14T12:00:00.000Z');

describe('POST /api/refreshVivinoDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 without a session', async () => {
    mockGetUserSession.mockResolvedValue({ user: undefined } as Awaited<
      ReturnType<typeof getUserSession>
    >);

    const response = await POST();
    expect(response.status).toBe(401);
    expect(mockStamp).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('returns 429 and does not scrape when the user is on cooldown', async () => {
    mockGetUserSession.mockResolvedValue({
      user: { _id: 'user-1' },
    } as Awaited<ReturnType<typeof getUserSession>>);
    mockStamp.mockResolvedValue({
      ok: false,
      reason: 'cooldown',
      nextAvailableAt,
    });

    const response = await POST();
    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Refresh not available yet',
      nextAvailableAt: nextAvailableAt.toISOString(),
      updated: 0,
    });
    expect(mockGetUserWine).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
    expect(mockBulkUpdate).not.toHaveBeenCalled();
  });

  it('stamps on accept, refreshes owned wines, and revalidates', async () => {
    const wines = [
      {
        _id: 'wine-1',
        title: 'Owned',
        country: 'Spain',
        year: 2016,
        comment: null,
        shelf: 1,
        column: 1,
        img: '',
        rating: '4',
        price: 100,
        vintageId: 111,
        vivinoUrl: null,
      },
    ];
    const updates = [{ wineId: 'wine-1', currentPrice: 499 }];

    mockGetUserSession.mockResolvedValue({
      user: { _id: 'user-1' },
    } as Awaited<ReturnType<typeof getUserSession>>);
    mockStamp.mockResolvedValue({
      ok: true,
      refreshedAt: new Date('2026-09-14T12:00:00.000Z'),
      nextAvailableAt,
    });
    mockGetUserWine.mockResolvedValue(wines);
    mockRefresh.mockResolvedValue({
      updated: 1,
      skipped: 0,
      failed: 0,
      updates,
    });
    mockBulkUpdate.mockResolvedValue(undefined);

    const response = await POST();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      updated: 1,
      skipped: 0,
      failed: 0,
      nextAvailableAt: nextAvailableAt.toISOString(),
    });

    expect(mockStamp).toHaveBeenCalledWith('user-1');
    expect(mockGetUserWine).toHaveBeenCalledWith({ _id: 'user-1' });
    expect(mockRefresh).toHaveBeenCalledWith(wines);
    expect(mockBulkUpdate).toHaveBeenCalledWith(updates);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
  });
});

describe('GET /api/refreshVivinoDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 without a session', async () => {
    mockGetUserSession.mockResolvedValue({ user: undefined } as Awaited<
      ReturnType<typeof getUserSession>
    >);

    const response = await GET();
    expect(response.status).toBe(401);
    expect(mockGetRefreshedAt).not.toHaveBeenCalled();
  });

  it('returns the stored cooldown for the signed-in user', async () => {
    const refreshedAt = new Date().toISOString();
    mockGetUserSession.mockResolvedValue({
      user: { _id: 'user-1' },
    } as Awaited<ReturnType<typeof getUserSession>>);
    mockGetRefreshedAt.mockResolvedValue(refreshedAt);

    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      onCooldown: true,
      nextAvailableAt: nextVivinoLibraryRefreshAt(refreshedAt)!.toISOString(),
      refreshedAt,
    });
    expect(mockGetRefreshedAt).toHaveBeenCalledWith('user-1');
  });
});
