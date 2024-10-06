'use server';
import { revalidatePath } from 'next/cache';
import { connectMongo } from './';
import UserDataBase from './user-schema';
import { getUserSession } from '@/lib/session';

export const updateStorageSize = async <T>(_: unknown, formData: FormData) => {
  try {
    const session = await getUserSession();
    if (!session.user) {
      throw new Error('User not found');
    }

    const shelves = formData.get('shelves') as string;
    const columns = Number(formData.get('columns'));

    await connectMongo();

    const update = await UserDataBase.findOneAndUpdate(
      {
        _id: session.user._id,
      },
      {
        shelves,
        columns,
      },
      {
        new: true,
      }
    );

    session.user.shelves = update.shelves;
    session.user.columns = update.columns;
    await session.save();

    revalidatePath('/dashboard');
    return {
      isSubmitted: true,
      updatedStorageSize: JSON.parse(
        JSON.stringify({ shelves: update.shelves, columns: update.columns })
      ),
    } as T;
  } catch (e) {
    console.error(e, 'user / update storage size');
    return { error: true, errorMessage: 'Failed to update storage size.' } as T;
  }
};
