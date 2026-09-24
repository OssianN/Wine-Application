'use server';
import { revalidatePath } from 'next/cache';
import { getUserSession } from '@/lib/session';
import WineDataBase from '../mongoDB/wine-schema';
import UserDataBase from './user-schema';
import { connectMongo } from './';

type MoveWineResult =
  | { ok: true }
  | { ok: false; reason: 'not-found' | 'occupied' | 'error' };

export const moveWine = async (
  shelf: string,
  column: string,
  wineId: string
): Promise<MoveWineResult> => {
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
    if (!wine) {
      return { ok: false, reason: 'not-found' };
    }

    const occupant = await WineDataBase.findOne({
      _id: { $in: ownedWineIds, $ne: wine._id },
      shelf: targetShelf,
      column: targetColumn,
      archived: { $ne: true },
    });

    if (occupant) {
      return { ok: false, reason: 'occupied' };
    }

    await WineDataBase.findByIdAndUpdate(
      wineId,
      {
        shelf: targetShelf,
        column: targetColumn,
      },
      {
        new: true,
      }
    );

    revalidatePath('/dashboard');
    return { ok: true };
  } catch (e) {
    console.error(e, 'wines / move new wine');
    return { ok: false, reason: 'error' };
  }
};
