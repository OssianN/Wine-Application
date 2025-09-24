'use server';
import { chromium } from 'playwright';
import {
  getCurrentPriceOfWine,
  getWineCountry,
  getWineImg,
  getWineRating,
} from './dataExtractUtils';

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

    const { browser, context } = await startBrowserContext();

    const searchPage = await context.newPage();
    await searchPage.goto(
      `https://www.vivino.com/sv/search/wines?q=${cleanSearchTitle}+${year}`,
      { waitUntil: 'networkidle' }
    );
    await searchPage.waitForTimeout(Math.random() * 1500 + 500);

    const wineAnchor = await searchPage.$('.anchor_anchor__m8Qi-');
    const href = await wineAnchor?.evaluate(el => {
      return el.getAttribute('href');
    });

    if (!href) {
      await browser.close();
      return undefined;
    }

    const winePageUrl = `https://www.vivino.com${href.replace('/en', '/sv')}`;

    const winePage = await context.newPage();
    await winePage.goto(winePageUrl, { waitUntil: 'networkidle' });
    await winePage.waitForTimeout(Math.random() * 1500 + 500);

    if (!winePage) {
      return undefined;
    }

    const [img, rating, country, currentPrice] = await Promise.all([
      getWineImg(winePage),
      getWineRating(searchPage),
      getWineCountry(searchPage),
      getCurrentPriceOfWine(winePage),
    ]);

    browser.close();

    return { img, rating, country, currentPrice, winePageUrl };
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

export const startBrowserContext = async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'sv-SE',
    timezoneId: 'Europe/Stockholm',
    extraHTTPHeaders: {
      'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1',
    },
  });

  return { context, browser };
};
