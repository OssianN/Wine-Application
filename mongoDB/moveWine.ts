'use server';
import { revalidatePath } from 'next/cache';
import WineDataBase from '../mongoDB/wine-schema';
import { connectMongo } from './';

export type MoveWineResult =
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

    const wine = await WineDataBase.findById(wineId);
    if (!wine) {
      return { ok: false, reason: 'not-found' };
    }

    const occupant = await WineDataBase.findOne({
      _id: { $ne: wine._id },
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
