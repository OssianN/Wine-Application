'use server';
import WineDataBase from './wine-schema';
import { connectMongo } from '.';
import { revalidatePath } from 'next/cache';

export const archiveWine = async (wineId: string) => {
  try {
    await connectMongo();
    await WineDataBase.findByIdAndUpdate(wineId, {
      archived: true,
    });

    revalidatePath('/dashboard');
  } catch (e) {
    console.error(e, 'wines / archive new wine');
  }
};
