'use server';
// import { load } from 'cheerio';

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

    const { data } = await fetchWebsiteData(url);
    console.log({ data });
    // const $ = load(content);

    // const img = $('.wineCard__bottleSection--3Bzic img').first().attr('src');
    // const rating = $('.vivinoRating__averageValue--3p6Wp').first().text();
    // const country = $('.wineInfoLocation__regionAndCountry--1nEJz')
    //   .first()
    //   .text();
    // const vivinoUrl = $('.wineCard__cardLink--3F_uB').first().attr('href');

    return {
      img: null,
      rating: null,
      country: null,
      vivinoUrl: null,
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
  const browserIOUrl = `https://production-sfo.browserless.io/scrape?token=${TOKEN}`;
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
  };

  const data = {
    url,
    elements: [
      { selector: '.wineCard__bottleSection--3Bzic img' },
      { selector: '.vivinoRating__averageValue--3p6Wp' },
      { selector: '.wineInfoLocation__regionAndCountry--1nEJz' },
      { selector: '.wineCard__cardLink--3F_uB' },
    ],
    waitForSelector: {
      selector: '.vivinoRating__averageValue--3p6Wp',
      timeout: 5000,
    },
    // rejectResourceTypes: ['image'],
    // rejectRequestPattern: ['/^.*\\.(css)'],
  };

  const response = await fetch(browserIOUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data),
  });

  return await response.json();
};

// type ScrapingResponse = {
//   content: string;
//   cookies: [];
// };

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
