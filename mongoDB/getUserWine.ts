'use server';
import { connectMongo } from './';
import UserDataBase from './user-schema';
import WineDataBase from './wine-schema';
import type { User, Wine } from '@/types';

export const getUserWine = async (_id: string): Promise<Wine[]> => {
  await connectMongo();

  const userDb = await UserDataBase.findById<User>({
    _id,
  });

  if (!userDb) {
    return [];
  }

  return await WineDataBase.find({ _id: { $in: [...userDb.wineList] } });
};
