'use server';
import {
  nextVivinoLibraryRefreshAt,
  VIVINO_LIBRARY_REFRESH_COOLDOWN_MS,
} from '@/lib/vivinoLibraryRefresh';
import { connectMongo } from '.';
import UserDataBase from './user-schema';

export type StampVivinoLibraryRefreshResult =
  | { ok: true; refreshedAt: Date; nextAvailableAt: Date }
  | { ok: false; reason: 'not_found' }
  | { ok: false; reason: 'cooldown'; nextAvailableAt: Date };

export const getVivinoLibraryRefreshedAt = async (
  userId: string
): Promise<string | null> => {
  await connectMongo();
  const user = await UserDataBase.findById(userId).lean<{
    vivinoLibraryRefreshedAt?: Date | null;
  }>();
  const refreshedAt = user?.vivinoLibraryRefreshedAt;
  if (!refreshedAt) return null;
  const time = new Date(refreshedAt).getTime();
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
};

export const stampVivinoLibraryRefresh = async (
  userId: string,
  now = new Date()
): Promise<StampVivinoLibraryRefreshResult> => {
  await connectMongo();
  const cutoff = new Date(now.getTime() - VIVINO_LIBRARY_REFRESH_COOLDOWN_MS);

  const updated = await UserDataBase.findOneAndUpdate(
    {
      _id: userId,
      $or: [
        { vivinoLibraryRefreshedAt: { $exists: false } },
        { vivinoLibraryRefreshedAt: null },
        { vivinoLibraryRefreshedAt: { $lte: cutoff } },
      ],
    },
    { $set: { vivinoLibraryRefreshedAt: now } },
    { new: true }
  ).lean<{ vivinoLibraryRefreshedAt?: Date | null }>();

  if (updated) {
    const nextAvailableAt = nextVivinoLibraryRefreshAt(now);
    if (!nextAvailableAt) {
      return { ok: false, reason: 'not_found' };
    }
    return { ok: true, refreshedAt: now, nextAvailableAt };
  }

  const user = await UserDataBase.findById(userId).lean<{
    vivinoLibraryRefreshedAt?: Date | null;
  }>();
  if (!user) return { ok: false, reason: 'not_found' };

  const nextAvailableAt =
    nextVivinoLibraryRefreshAt(user.vivinoLibraryRefreshedAt) ??
    nextVivinoLibraryRefreshAt(now);

  if (!nextAvailableAt) {
    return { ok: false, reason: 'not_found' };
  }

  return { ok: false, reason: 'cooldown', nextAvailableAt };
};
