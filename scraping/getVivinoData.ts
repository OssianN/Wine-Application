'use server';
// import type { Browser, Page } from 'puppeteer-core';
// import { getCurrentPriceOfWine, getWineImg } from './dataExtractUtils';
// import { getChromiumPath } from './setupChromium';

export const getVivinoData = async ({ title }: { title: string }) => {
  try {
    const { data } = await fetchWebsiteData(title);
    const img = data[0].results[2].attributes.find(
      attr => attr.name === 'srcset'
    );
    console.log({ data: data[0].results });

    return {
      img: img?.value,
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
  const url = `https://production-sfo.browserless.io/scrape?token=${TOKEN}`;
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
  };

  const searchTitle = title.split(' ').join('+');
  const cleanSearchTitle = searchTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f’]/g, '');

  const data = {
    url: `https://www.systembolaget.se/sortiment/?q=${cleanSearchTitle}`,
    elements: [{ selector: 'img' }],
    waitForSelector: {
      selector: '#stock_scrollcontainer',
      timeout: 5000,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data),
  });

  return await response.json();
};

type ScrapingResponse = {
  data: {
    results: {
      attributes: {
        name: string;
        value: string;
      }[];
      height: number;
      html: string;
      left: number;
      text: string;
      top: number;
      width: number;
    }[];
    selector: string;
  }[];
};
