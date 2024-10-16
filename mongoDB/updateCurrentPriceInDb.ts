'use server';
import WineDataBase from './wine-schema';
import { connectMongo } from '.';

export const updateCurrentPriceInDb = async (
  wineId: string,
  currentPrice: number
) => {
  await connectMongo();

  WineDataBase.findByIdAndUpdate(wineId, {
    $set: { currentPrice },
  }).exec();
};
