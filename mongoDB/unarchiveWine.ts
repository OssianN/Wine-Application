'use server';
import { revalidatePath } from 'next/cache';
import { getUserSession } from '@/lib/session';
import { unarchiveDecision } from '@/lib/unarchiveDecision';
import WineDataBase from './wine-schema';
import UserDataBase from './user-schema';
import { getUserWine } from './getUserWine';
import { connectMongo } from './';

type UnarchiveWineResult =
  | { ok: true }
  | { ok: false; reason: 'not-found' | 'occupied' | 'error' };

export const listOpenCellarSlots = async () => {
  await connectMongo();

  const session = await getUserSession();
  const user = session.user;
  if (!user) return [];

  const activeWines = await getUserWine({
    _id: user._id,
    isArchived: false,
  });
  const taken = new Set(
    activeWines.map(wine => `${wine.shelf}:${wine.column}`)
  );
  const slots: { shelf: number; column: number }[] = [];

  for (let shelf = 0; shelf < user.shelves; shelf += 1) {
    for (let column = 0; column < user.columns; column += 1) {
      if (taken.has(`${shelf}:${column}`)) continue;
      slots.push({ shelf, column });
    }
  }

  return slots;
};

export const unarchiveWine = async (
  wineId: string,
  shelf: number,
  column: number,
  comment: string
): Promise<UnarchiveWineResult> => {
  try {
    await connectMongo();

    const targetShelf = Number(shelf);
    const targetColumn = Number(column);

    const session = await getUserSession();
    const user = session.user
      ? await UserDataBase.findById(session.user._id)
      : null;
    const ownedWineIds = user?.wineList ?? [];
    const ownsWine = ownedWineIds.some(id => String(id) === String(wineId));
    const wine = ownsWine ? await WineDataBase.findById(wineId) : null;

    const occupant = wine
      ? await WineDataBase.findOne({
          _id: { $in: ownedWineIds, $ne: wine._id },
          shelf: targetShelf,
          column: targetColumn,
          archived: { $ne: true },
        })
      : null;

    const decision = unarchiveDecision({
      wine: wine
        ? {
            _id: String(wine._id),
            archived: wine.archived,
            shelf: wine.shelf,
            column: wine.column,
            comment: wine.comment,
          }
        : null,
      owned: Boolean(wine),
      activeWines: occupant
        ? [
            {
              _id: String(occupant._id),
              shelf: occupant.shelf,
              column: occupant.column,
            },
          ]
        : [],
      shelf: targetShelf,
      column: targetColumn,
      comment,
    });

    if (decision.result !== 'update') {
      return { ok: false, reason: decision.result };
    }

    await WineDataBase.findByIdAndUpdate(wineId, {
      archived: decision.update.archived,
      shelf: decision.update.shelf,
      column: decision.update.column,
      comment: decision.update.comment,
    });

    revalidatePath('/dashboard');
    return { ok: true };
  } catch (e) {
    console.error(e, 'wines / unarchive wine');
    return { ok: false, reason: 'error' };
  }
};
