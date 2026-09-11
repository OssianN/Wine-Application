'use server';
import WineDataBase from './wine-schema';
import { connectMongo } from '.';

export const updateDrinkingWindowInDb = async (
  wineId: string,
  drinkingWindow: {
    drinkingWindowStart?: number | null;
    drinkingWindowEnd?: number | null;
    drinkingWindowStatus?: number | null;
  }
) => {
  await connectMongo();

  await WineDataBase.findByIdAndUpdate(wineId, {
    $set: drinkingWindow,
  }).exec();
};
