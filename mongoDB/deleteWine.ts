'use server';
import WineDataBase from './wine-schema';
import { connectMongo } from './';
import UserDataBase from './user-schema';
import { getUserSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import type { User } from '@/types';

export const deleteWine = async (wineId: string) => {
  try {
    const [session] = await Promise.all([
      await getUserSession(),
      await connectMongo(),
    ]);

    if (!session.user) {
      return null;
    }

    const userDb = await UserDataBase.findById<User>({
      _id: session.user._id,
    });

    if (!userDb) {
      return [];
    }

    const updatedList = userDb.wineList.filter(id => id !== wineId);

    await Promise.all([
      WineDataBase.findByIdAndDelete(wineId),
      UserDataBase.findByIdAndUpdate(session.user._id, {
        wineList: updatedList,
      }),
    ]);
    revalidatePath('/dashboard');
  } catch (err) {
    console.error(err, 'wines / delete wine');
  }
};
