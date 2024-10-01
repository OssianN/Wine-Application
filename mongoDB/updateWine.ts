'use server';
import { redirect } from 'next/navigation';
import WineDataBase from '../mongoDB/wine-schema';
import getVivinoData from '../scraping/cheerio';
import { connectMongo } from './';
import { ScrapingResult } from '@/types';
import { revalidatePath } from 'next/cache';

export const updateWine = async (
  prev: any,
  formData: FormData
  // _id: string
) => {
  try {
    const _id = '';
    const title = formData.get('title') as string;
    const year = Number(formData.get('year'));
    const price = Number(formData.get('price'));
    const comment = formData.get('comment') as string;
    const archived = formData.get('archived') as string;

    const [scraping] = await Promise.all([
      getVivinoData(title, year),
      connectMongo(),
    ]);
    const { img, rating, country, vivinoUrl } = scraping as ScrapingResult;

    // const newWine = await WineDataBase.findOneAndUpdate(
    //   {
    //     _id,
    //   },
    //   {
    //     title,
    //     country,
    //     year,
    //     price,
    //     comment,
    //     archived,
    //     img,
    //     rating,
    //     vivinoUrl,
    //   },
    //   {
    //     new: true,
    //   }
    // );

    revalidatePath('/dashboard');
    return null;
  } catch (err) {
    console.error(err, 'wines / update new wine');
  }
};
