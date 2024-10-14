'use server';
import WineDataBase from '../mongoDB/wine-schema';
import UserDataBase from './user-schema';
import getVivinoData from '../scraping/cheerio';
import { connectMongo } from './';
import { getUserSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { wineFormSchema } from '@/lib/schemas';
import type { ScrapingResult, User } from '@/types';

export const postNewWine = async <T>(
  _: unknown,
  formData: FormData,
  column?: string,
  shelf?: string
) => {
  try {
    const title = formData.get('title');
    const year = isNaN(Number(formData.get('year')))
      ? 'string'
      : Number(formData.get('year'));
    const price = isNaN(Number(formData.get('price')))
      ? 'string'
      : Number(formData.get('price'));
    const comment = formData.get('comment');

    const parse = wineFormSchema.safeParse({
      title,
      year,
      price,
      comment,
    });

    if (!parse.success) {
      return { errors: parse.error.errors } as T;
    }

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
      country: country ?? null,
      year,
      price,
      comment,
      img: img ?? null,
      rating: rating ?? null,
      vivinoUrl: vivinoUrl ?? null,
      shelf,
      column,
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
      UserDataBase.findOneAndUpdate(
        { _id: session.user._id },
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
