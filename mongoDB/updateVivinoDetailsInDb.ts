'use server';
import WineDataBase from './wine-schema';
import { connectMongo } from '.';

export const updateVivinoDetailsInDb = async (
  wineId: string,
  details: {
    currentPrice?: number | null;
    vintageId?: number | null;
    drinkingWindowStart?: number | null;
    drinkingWindowEnd?: number | null;
    drinkingWindowStatus?: number | null;
  }
) => {
  const $set = Object.fromEntries(
    Object.entries(details).filter(([, value]) => value != null)
  );
  if (Object.keys($set).length === 0) return;

  await connectMongo();
  await WineDataBase.findByIdAndUpdate(wineId, { $set }).exec();
};
