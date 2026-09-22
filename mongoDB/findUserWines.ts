import { connectMongo } from './';
import UserDataBase from './user-schema';
import WineDataBase from './wine-schema';
import type { User, Wine } from '@/types';

export const findUserWines = async (_id: string): Promise<Wine[]> => {
  await connectMongo();

  const userDb = await UserDataBase.findById<User>({
    _id,
  });

  if (!userDb) {
    return [];
  }

  const list = await WineDataBase.find({
    _id: { $in: [...userDb.wineList] },
  }).lean();

  return JSON.parse(JSON.stringify(list));
};
