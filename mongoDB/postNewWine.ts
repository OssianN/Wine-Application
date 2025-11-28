'use server';
import WineDataBase from '../mongoDB/wine-schema';
import UserDataBase from './user-schema';
import { getVivinoData } from '../scraping/getVivinoData';
import { connectMongo } from './';
import { getUserSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { wineDto } from '@/lib/wineDto';
import { parseWine } from '@/lib/parseWine';
import type { User } from '@/types';

export const postNewWine = async <T>(
  _: unknown,
  formData: FormData,
  shelf?: string,
  column?: string
) => {
  try {
    const {
      isError,
      errors,
      data: parsedData,
      positionData,
    } = await parseWine(formData, shelf, column);

    if (isError || !parsedData || !positionData) {
      return {
        errors,
        errorMessage: 'Something went wrong, try again.',
      } as T;
    }

    const [scraping, session] = await Promise.all([
      getVivinoData({ title: parsedData.title }),
      getUserSession(),
      connectMongo(),
    ]);

    const data = wineDto({
      ...parsedData,
      scraping,
    });

    if (!session.user) {
      throw new Error('User not found');
    }

    const wine = new WineDataBase({
      ...data,
      ...positionData,
    });

    const userDb = await UserDataBase.findById<User>({
      _id: session.user._id,
    });

    if (!userDb) {
      return {
        errorMessage: 'Sorry, could not add new wine.',
      } as T;
    }

    await Promise.all([
      UserDataBase.findByIdAndUpdate(
        session.user._id,
        { wineList: [...userDb.wineList, wine._id] },
        { new: true }
      ),
      wine.save(),
    ]);

    revalidatePath('/dashboard');
    return { isSubmitted: true } as T;
  } catch (err) {
    console.error(err, 'wines / post new wine');
    return {
      errorMessage: 'Sorry, could not add new wine.',
    } as T;
  }
};
