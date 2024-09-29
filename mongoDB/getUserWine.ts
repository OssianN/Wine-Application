import connectMongo from '.';
import WineDataBase from './wine-schema';
import type { Wine } from '@/types';

export const getUserWine = async (wineList: string[]): Promise<Wine[]> => {
  if (!wineList) {
    return [];
  }

  await connectMongo();

  return await WineDataBase.find({ _id: { $in: [...wineList] } });
};
