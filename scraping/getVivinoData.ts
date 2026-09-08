'use server';
import { load } from 'cheerio';

const WINE_CARD_SELECTOR = '[class*="wineCard__wineCard"]';

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
    if (!content) return undefined;

    const $ = load(content);
    const card = $(WINE_CARD_SELECTOR).first();
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
  const params = new URLSearchParams({
    token: TOKEN ?? '',
    proxy: 'residential',
    proxyCountry: 'se',
    blockAds: 'true',
    blockAdsInclude:
      'ublock-filters,easylist,easyprivacy,pgl,ublock-badware,urlhaus-full',
  });
  // Amsterdam is closer to the Swedish proxy than SFO, so less round-trip.
  const browserIOUrl = `https://production-ams.browserless.io/unblock?${params}`;

  const response = await fetch(browserIOUrl, {
    method: 'POST',
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      content: true,
      cookies: false,
      screenshot: false,
      browserWSEndpoint: false,
      bestAttempt: true,
      gotoOptions: {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      },
      waitForSelector: {
        selector: WINE_CARD_SELECTOR,
        timeout: 8000,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Browserless unblock failed: ${response.status} ${errorBody}`
    );
  }

  return await response.json();
};

type ScrapingResponse = {
  content?: string;
};
