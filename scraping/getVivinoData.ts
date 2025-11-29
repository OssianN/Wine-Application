'use server';
import { load } from 'cheerio';
// import type { Browser, Page } from 'puppeteer-core';
// import { getCurrentPriceOfWine, getWineImg } from './dataExtractUtils';
// import { getChromiumPath } from './setupChromium';

export const getVivinoData = async ({ title }: { title: string }) => {
  try {
    const { content } = await fetchWebsiteData(title);
    const $ = load(content);

    const img = $('.wineCard__bottleSection--3Bzic img').attr('src');

    return {
      img,
      currentPrice: null,
      rating: null,
      country: null,
      winePageUrl: null,
    };
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

export const fetchWebsiteData = async (
  title: string
): Promise<ScrapingResponse> => {
  const TOKEN = process.env.BROWSWER_IO_KEY;
  const url = `https://production-sfo.browserless.io/unblock?token=${TOKEN}&proxy=residential`;
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
  };

  const searchTitle = title.split(' ').join('+');
  const cleanSearchTitle = searchTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f’]/g, '');

  const data = {
    url: `https://www.vivino.com/sv/search/wines?q=${cleanSearchTitle}`,
    content: true,
  };

  const response = await fetch(url, {
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
