/**
 * @jest-environment node
 */

process.env.MONGODB_URI ??= 'mongodb://localhost:27017/test';

import { VIVINO_LIBRARY_REFRESH_COOLDOWN_MS } from '@/lib/vivinoLibraryRefresh';
import UserDataBase from '@/mongoDB/user-schema';
import { stampVivinoLibraryRefresh } from './stampVivinoLibraryRefresh';

jest.mock('./index', () => ({
  connectMongo: jest.fn(),
}));
jest.mock('./user-schema', () => ({
  __esModule: true,
  default: {
    findOneAndUpdate: jest.fn(),
    findById: jest.fn(),
  },
}));

const mockUser = UserDataBase as unknown as {
  findOneAndUpdate: jest.Mock;
  findById: jest.Mock;
};

const leanQuery = (value: unknown) => ({
  lean: jest.fn().mockResolvedValue(value),
});

describe('stampVivinoLibraryRefresh', () => {
  const now = new Date('2026-09-14T12:00:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stamps the user and proceeds when they have never refreshed', async () => {
    mockUser.findOneAndUpdate.mockReturnValue(
      leanQuery({ vivinoLibraryRefreshedAt: now })
    );

    await expect(stampVivinoLibraryRefresh('user-1', now)).resolves.toEqual({
      ok: true,
      refreshedAt: now,
      nextAvailableAt: new Date(now.getTime() + VIVINO_LIBRARY_REFRESH_COOLDOWN_MS),
    });
    expect(mockUser.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'user-1' }),
      { $set: { vivinoLibraryRefreshedAt: now } },
      { new: true }
    );
  });

  it('rejects a second press within 30 days without scraping', async () => {
    mockUser.findOneAndUpdate.mockReturnValue(leanQuery(null));
    mockUser.findById.mockReturnValue(
      leanQuery({ vivinoLibraryRefreshedAt: now })
    );

    await expect(stampVivinoLibraryRefresh('user-1', now)).resolves.toEqual({
      ok: false,
      reason: 'cooldown',
      nextAvailableAt: new Date(now.getTime() + VIVINO_LIBRARY_REFRESH_COOLDOWN_MS),
    });
  });

  it('allows a press after 30 days', async () => {
    const previous = new Date(now.getTime() - VIVINO_LIBRARY_REFRESH_COOLDOWN_MS);
    mockUser.findOneAndUpdate.mockReturnValue(
      leanQuery({ vivinoLibraryRefreshedAt: now })
    );

    await expect(stampVivinoLibraryRefresh('user-1', now)).resolves.toMatchObject({
      ok: true,
      refreshedAt: now,
    });
    const filter = mockUser.findOneAndUpdate.mock.calls[0][0];
    expect(filter.$or).toEqual(
      expect.arrayContaining([
        { vivinoLibraryRefreshedAt: { $lte: previous } },
      ])
    );
  });
});
