'use server';
import { connectMongo } from './';
import UserDataBase from './user-schema';
import WineDataBase from './wine-schema';
import type { Wine } from '@/types';

export const getUserWine = async (_id: string): Promise<Wine[]> => {
  await connectMongo();

  const user = await UserDataBase.findById({
    _id,
  }).select('wineList');

  return await WineDataBase.find({ _id: { $in: [...user.wineList] } });
};
