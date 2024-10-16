'use server';
import WineDataBase from './wine-schema';

export const updateCurrentPriceInDb = (
  wineId: string,
  currentPrice: number
) => {
  WineDataBase.findByIdAndUpdate(wineId, {
    $set: { currentPrice },
  }).exec();
};
