'use server';
import { getHtmlFromTitle } from './getHtmlFromInput';

const getVivinoData = async (title: string, year: number) => {
  try {
    // currentPrice
    const data = await getHtmlFromTitle({ title, year });

    if (!data) {
      throw new Error('No data found');
    }

    const { img, rating, country, winePageUrl } = data; //currentPrice

    return {
      img,
      rating,
      country,
      vivinoUrl: winePageUrl,
      currentPrice: null,
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export default getVivinoData;
