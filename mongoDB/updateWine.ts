'use server';
import { revalidatePath } from 'next/cache';
import WineDataBase from '../mongoDB/wine-schema';
import { getVivinoData } from '../scraping/getVivinoData';
import { connectMongo } from './';
import { parseWine } from '@/lib/parseWine';
import { wineDto } from '@/lib/wineDto';

export const updateWine = async <T>(
  _: unknown,
  formData: FormData,
  wineId: string
) => {
  try {
    const { data: parsedData, errors, isError } = await parseWine(formData);

    if (isError || !parsedData) {
      return { errors, errorMessage: 'Something went wrong, try again.' } as T;
    }

    const [scraping] = await Promise.all([
      getVivinoData({ title: parsedData.title, year: parsedData.year }),
      connectMongo(),
    ]);

    const data = wineDto({
      ...parsedData,
      scraping,
    });

    const updatedWine = await WineDataBase.findByIdAndUpdate(
      wineId,
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
