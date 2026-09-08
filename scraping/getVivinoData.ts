'use server';
import { load } from 'cheerio';

export const getVivinoData = async ({
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
    const url = `https://www.vivino.com/sv/search/wines?q=${cleanSearchTitle}+${year}`;

    const { content } = await fetchWebsiteData(url);
    const $ = load(content);
    const card = $('[class*="wineCard__wineCard"]').first();
    const imgEl = card
      .find('[class*="wineCard__bottleSection"] img, [class*="wineCard__bottleShot"] img')
      .first();
    const img = imgEl.attr('src') || imgEl.attr('data-src');
    const rating = card.find('[class*="averageValue"]').first().text().trim();
    const country = (
      card.find('[class*="regionAndCountry"]').first().text() ||
      card.find('[class*="wineInfoLocation"]').first().text()
    ).trim();
    const vivinoHref =
      (card.is('a') ? card.attr('href') : undefined) ||
      card.find('[class*="wineCard__cardLink"]').first().attr('href') ||
      $('[class*="wineCard__cardLink"]').first().attr('href');

    return {
      img,
      rating,
      country,
      vivinoUrl: vivinoHref
        ? vivinoHref.startsWith('http')
          ? vivinoHref
          : `https://www.vivino.com${vivinoHref}`
        : null,
    };
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

export const fetchWebsiteData = async (
  url: string
): Promise<ScrapingResponse> => {
  const TOKEN = process.env.BROWSWER_IO_KEY;
  const browserIOUrl = `https://production-sfo.browserless.io/unblock?token=${TOKEN}&proxy=residential`;
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
  };

  const data = {
    url,
    content: true,
  };

  const response = await fetch(browserIOUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data),
  });

  return await response.json();
};

type ScrapingResponse = {
  content: string;
  cookies: [];
};
