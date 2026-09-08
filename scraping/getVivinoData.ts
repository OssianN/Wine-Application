'use server';
import { load } from 'cheerio';

const WINE_CARD_SELECTOR = '[data-testid="wineCard"]';
const WINE_IMAGE_SELECTOR = '[data-testid="deferredHiddenImage"]';
const WINE_LINK_SELECTOR = '[data-testid="vintagePageLink"]';

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
    const url = `https://www.vivino.com/sv/explore?search_term=${cleanSearchTitle}+${year}`;

    const { content } = await fetchWebsiteData(url);
    if (!content) return undefined;

    const $ = load(content);
    const card = $(WINE_CARD_SELECTOR).first();
    const imgEl = card.find(WINE_IMAGE_SELECTOR).first();
    const rawImg = imgEl.attr('src') || imgEl.attr('data-src');
    const img = rawImg
      ? rawImg.startsWith('http')
        ? rawImg
        : `https:${rawImg}`
      : undefined;
    const rating = card.find('[class*="averageValue"]').first().text().trim();
    const country = (
      card.find('[class*="regionAndCountry"]').first().text() ||
      card.find('[class*="wineInfoLocation"]').first().text()
    ).trim();
    const vivinoHref =
      card.find(WINE_LINK_SELECTOR).first().attr('href') ||
      (card.is('a') ? card.attr('href') : undefined);

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
        selector: `${WINE_CARD_SELECTOR} ${WINE_IMAGE_SELECTOR}`,
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
