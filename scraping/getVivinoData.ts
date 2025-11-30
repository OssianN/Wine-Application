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

    const img = $('.wineCard__bottleSection--3Bzic img').first().attr('src');
    const rating = $('.vivinoRating__averageValue--3p6Wp').first().text();
    const country = $('.wineInfoLocation__regionAndCountry--1nEJz')
      .first()
      .text();
    const vivinoUrl = $('.wineCard__cardLink--3F_uB').first().attr('href');

    return {
      img,
      rating,
      country,
      vivinoUrl: vivinoUrl ? `https://www.vivino.com${vivinoUrl}` : null,
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const fetchWebsiteData = async (
  url: string
): Promise<ScrapingResponse> => {
  try {
    const TOKEN = process.env.BROWSWER_IO_KEY;
    const browserIOUrl = `https://production-sfo.browserless.io/unblock?token=${TOKEN}&proxy=residential`;
    const headers = {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
    };

    const data = {
      url,
      content: true,
      // rejectResourceTypes: ['image'],
      // rejectRequestPattern: ['/^.*\\.(css)'],
    };

    const response = await fetch(browserIOUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (e) {
    console.error('Error fetching website data:', e);
    throw e;
  }
};

type ScrapingResponse = {
  content: string;
  cookies: [];
};
