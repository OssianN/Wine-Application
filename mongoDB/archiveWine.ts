'use server';
import WineDataBase from './wine-schema';
import { connectMongo } from '.';

export const updateWine = async <T>(wineId: string) => {
  try {
    await connectMongo();
    await WineDataBase.findOneAndUpdate(
      {
        _id: wineId,
      },
      {
        archived: true,
      }
    );

    return { isSubmitted: true } as T;
  } catch (e) {
    console.error(e, 'wines / archive new wine');
    return {
      error: true,
      errorMessage: 'Failed to archive wine.',
    } as T;
  }
};
