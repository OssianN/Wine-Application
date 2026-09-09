'use server';
import { load } from 'cheerio';
import type { ScrapingResult } from '@/types';
import {
  mapExploreMatch,
  toHttpsUrl,
  type ExploreResponse,
} from './mapExploreMatch';

const WINE_CARD_SELECTOR = '[data-testid="wineCard"]';
const WINE_IMAGE_SELECTOR = '[data-testid="deferredHiddenImage"]';
const WINE_LINK_SELECTOR = '[data-testid="vintagePageLink"]';
const EXPLORE_API_URL = 'https://www.vivino.com/api/explore/explore';
const FETCH_TIMEOUT_MS = 10_000;

const BROWSER_HEADERS = {
  Accept: 'application/json',
  'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
};

export const getVivinoData = async ({
  title,
  year,
}: {
  title: string;
  year: number;
}): Promise<ScrapingResult | undefined> => {
  try {
    const searchTerm = buildSearchTerm(title, year);
    if (process.env.VIVINO_FETCH === 'browserless') {
      return await getVivinoDataFromHtml(searchTerm);
    }
    return await getVivinoDataFromExploreApi(searchTerm);
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

const getVivinoDataFromExploreApi = async (searchTerm: string) => {
  const params = new URLSearchParams({
    search_term: searchTerm.replace(/\+/g, ' '),
    country_code: 'se',
    currency_code: 'SEK',
    page: '1',
    per_page: '1',
  });

  const response = await fetch(`${EXPLORE_API_URL}?${params}`, {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Vivino explore API failed: ${response.status} ${errorBody.slice(0, 300)}`
    );
  }

  const data = (await response.json()) as ExploreResponse;
  return mapExploreMatch(data.explore_vintage?.matches?.[0]);
};

const getVivinoDataFromHtml = async (searchTerm: string) => {
  const url = `https://www.vivino.com/sv/explore?search_term=${searchTerm}`;
  const { content } = await fetchWebsiteData(url);
  if (!content) return undefined;

  const $ = load(content);
  const card = $(WINE_CARD_SELECTOR).first();
  const imgEl = card.find(WINE_IMAGE_SELECTOR).first();
  const rawImg = imgEl.attr('src') || imgEl.attr('data-src');
  const vivinoHref =
    card.find(WINE_LINK_SELECTOR).first().attr('href') ||
    (card.is('a') ? card.attr('href') : undefined);

  return {
    img: toHttpsUrl(rawImg),
    rating: card.find('[class*="averageValue"]').first().text().trim(),
    country: (
      card.find('[class*="regionAndCountry"]').first().text() ||
      card.find('[class*="wineInfoLocation"]').first().text()
    ).trim(),
    vivinoUrl: toHttpsUrl(vivinoHref) ?? null,
  };
};

const buildSearchTerm = (title: string, year: number) => {
  const searchTitle = title.split(' ').join('+');
  const cleanSearchTitle = searchTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f’']/g, '');
  return `${cleanSearchTitle}+${year}`;
};

type ScrapingResponse = {
  content?: string;
};
