'use server';
import WineDataBase from '../mongoDB/wine-schema';
import getVivinoData from '../scraping/cheerio';
import { connectMongo } from './';
import { ScrapingResult } from '@/types';

export const postNewWine = async (formData: FormData) => {
  try {
    const title = formData.get('title') as string;
    const year = Number(formData.get('year'));
    const price = Number(formData.get('price'));
    const comment = formData.get('comment') as string;
    const shelf = Number(formData.get('shelf'));
    const column = Number(formData.get('column'));

    const [scraping] = await Promise.all([
      getVivinoData(title, year),
      connectMongo(),
    ]);
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
    const response = await wine.save();
    console.log(response);
    // return await response.json();
  } catch (err) {
    console.error(err, 'wines / post new wine');
  }
};
