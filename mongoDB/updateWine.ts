'use server';
import { revalidatePath } from 'next/cache';
import WineDataBase from '../mongoDB/wine-schema';
import getVivinoData from '../scraping/cheerio';
import { connectMongo } from './';
import { ScrapingResult } from '@/types';

export const updateWine = async <T>(
  _: unknown,
  formData: FormData,
  _id: string
) => {
  try {
    const title = formData.get('title') as string;
    const year = Number(formData.get('year'));
    const price = Number(formData.get('price'));
    const comment = formData.get('comment') as string;

    const [scraping] = await Promise.all([
      getVivinoData(title, year),
      connectMongo(),
    ]);
    const { img, rating, country, vivinoUrl } = scraping as ScrapingResult;

    const updatedWine = await WineDataBase.findOneAndUpdate(
      {
        _id,
      },
      {
        title,
        country,
        year,
        price,
        comment,
        img,
        rating,
        vivinoUrl,
      },
      {
        new: true,
      }
    );

    revalidatePath('/dashboard');
    return {
      isSubmitted: true,
      updatedWine: JSON.parse(JSON.stringify(updatedWine)),
    } as T;
  } catch (e) {
    console.error(e, 'wines / update new wine');
    return { error: true, errorMessage: 'Failed to update wine.' } as T;
  }
};
