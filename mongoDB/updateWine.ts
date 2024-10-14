'use server';
import { revalidatePath } from 'next/cache';
import WineDataBase from '../mongoDB/wine-schema';
import getVivinoData from '../scraping/cheerio';
import { connectMongo } from './';
import { parseWine } from '@/lib/parseWine';
import { wineDto } from '@/lib/wineDto';

export const updateWine = async <T>(
  _: unknown,
  formData: FormData,
  wineId: string
) => {
  try {
    const { title, year, price, comment, isError, errors } = parseWine(
      formData,
      undefined,
      undefined,
      true
    );

    if (isError) {
      return { errors, errorMessage: 'Something went wrong' } as T;
    }

    const [scraping] = await Promise.all([
      getVivinoData(title, year),
      connectMongo(),
    ]);

    const data = wineDto({
      title,
      year,
      price,
      comment,
      scraping,
    });

    const updatedWine = await WineDataBase.findOneAndUpdate(
      {
        _id: wineId,
      },
      {
        ...data,
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
