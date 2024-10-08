'use server';
import { revalidatePath } from 'next/cache';
import WineDataBase from '../mongoDB/wine-schema';
import { connectMongo } from './';

export const moveWine = async (
  shelf: string,
  column: string,
  wineId: string
) => {
  try {
    await connectMongo();
    await WineDataBase.findOneAndUpdate(
      {
        _id: wineId,
      },
      {
        shelf: Number(shelf),
        column: Number(column),
      },
      {
        new: true,
      }
    );

    revalidatePath('/dashboard');
  } catch (e) {
    console.error(e, 'wines / move new wine');
  }
};
