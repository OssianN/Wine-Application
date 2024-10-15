import { load } from 'cheerio';

export const getHtmlFromTitle = async ({
  title,
  year,
}: {
  title: string;
  year: number;
}) => {
  try {
    const searchTitle = title.split(' ').join('+');
    const cleanSearchTitle = searchTitle
      .normalize('NFD')
      .replace(/[\u0300-\u036f’]/g, '');

    const vivinoSite = await fetch(
      `https://www.vivino.com/search/wines?q=${cleanSearchTitle}+${year}`
    );
    const body = await vivinoSite.text();
    return load(body);
  } catch (e) {
    console.error(e);
    return null;
  }
};
