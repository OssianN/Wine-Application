'use server';
import WineDataBase from '../mongoDB/wine-schema';
import UserDataBase from './user-schema';
import getVivinoData from '../scraping/cheerio';
import { connectMongo } from './';
import type { ScrapingResult, User } from '@/types';
import { getUserSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export const postNewWine = async <T>(
  _: unknown,
  formData: FormData,
  column?: string,
  shelf?: string
) => {
  try {
    const title = formData.get('title') as string;
    const year = Number(formData.get('year'));
    const price = Number(formData.get('price'));
    const comment = formData.get('comment') as string;
    const [scraping, session] = await Promise.all([
      getVivinoData(title, year),
      getUserSession(),
      connectMongo(),
    ]);

    if (!session.user) {
      throw new Error('User not found');
    }

    const { img, rating, country, vivinoUrl } = scraping as ScrapingResult;
    const wine = new WineDataBase({
      title,
      country,
      year,
      price,
      comment,
      shelf,
      column,
      img,
      rating,
      vivinoUrl,
    });

    const userDb = await UserDataBase.findById<User>({
      _id: session.user._id,
    });

    if (!userDb) {
      return {
        error: true,
        errorMessage: 'Sorry, could not add new wine.',
      } as T;
    }

    await Promise.all([
      UserDataBase.findOneAndUpdate(
        { _id: session.user._id },
        { wineList: [...userDb.wineList, wine._id] },
        { new: true }
      ),
      wine.save(),
      session.save(),
    ]);

    revalidatePath('/dashboard');
    return { isSubmitted: true } as T;
  } catch (err) {
    console.error(err, 'wines / post new wine');
    return {
      error: true,
      errorMessage: 'Sorry, could not add new wine.',
    } as T;
  }
};
