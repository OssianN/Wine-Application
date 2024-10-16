'use server';
import WineDataBase from '../mongoDB/wine-schema';
import UserDataBase from './user-schema';
import getVivinoData from '../scraping/cheerio';
import { connectMongo } from './';
import { getUserSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { parseWine } from '@/lib/parseWine';
import { wineDto } from '@/lib/wineDto';
import type { User } from '@/types';

export const postNewWine = async <T>(
  _: unknown,
  formData: FormData,
  shelfInput?: string,
  columnInput?: string
) => {
  try {
    const { title, year, price, comment, shelf, column, isError, errors } =
      parseWine(formData, shelfInput, columnInput);

    if (isError) {
      return { errors, errorMessage: 'Something went wrong' } as T;
    }

    const [scraping, session] = await Promise.all([
      getVivinoData(title, year),
      getUserSession(),
      connectMongo(),
    ]);

    const data = wineDto({
      title,
      year,
      price,
      comment,
      shelf,
      column,
      scraping,
    });

    if (!session.user) {
      throw new Error('User not found');
    }

    const wine = new WineDataBase({
      ...data,
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
