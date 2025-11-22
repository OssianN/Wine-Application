'use server';
import type { Browser, Page } from 'puppeteer-core';
import {
  getCurrentPriceOfWine,
  getWineCountry,
  getWineImg,
  getWineRating,
} from './dataExtractUtils';
import { getChromiumPath } from './setupChromium';

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

    const browser = (await startBrowser()) as Browser;

    const searchPage = await browser.newPage();
    await configurePageSettings(searchPage as Page);

    searchPage.setDefaultNavigationTimeout(10000);
    searchPage.setDefaultTimeout(10000);

    await searchPage.goto(
      `https://www.vivino.com/sv/search/wines?q=${cleanSearchTitle}+${year}`,
      { waitUntil: 'domcontentloaded', timeout: 10000 }
    );

    const wineAnchor = await searchPage.$('.anchor_anchor__m8Qi-');
    console.log({ wineAnchor });
    const href = await wineAnchor?.evaluate(el => {
      return el.getAttribute('href');
    });

    if (!href) {
      await browser.close();
      return undefined;
    }

    const winePageUrl = `https://www.vivino.com${href.replace('/en', '/sv')}`;

    await searchPage.close();

    const winePage = await browser.newPage();
    await configurePageSettings(winePage as Page);

    winePage.setDefaultNavigationTimeout(10000);
    winePage.setDefaultTimeout(10000);

    await winePage.goto(winePageUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });

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

const configurePageSettings = async (page: Page) => {
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  );

  await page.setViewport({ width: 1920, height: 1080 });

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Upgrade-Insecure-Requests': '1',
  });
};

export const startBrowser = async () => {
  try {
    const isVercel = !!process.env.VERCEL_PROJECT_PRODUCTION_URL;
    let puppeteer;
    let launchOptions: Record<string, unknown> = {
      headless: true,
    };

    if (isVercel) {
      const chromium = (await import('@sparticuz/chromium-min')).default;
      puppeteer = await import('puppeteer-core');
      const executablePath = await getChromiumPath();
      launchOptions = {
        ...launchOptions,
        args: chromium.args,
        executablePath,
      };
      console.log('Launching browser with executable path:', executablePath);
    } else {
      puppeteer = await import('puppeteer');
    }

    return await puppeteer.launch(launchOptions);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Browser launch failed: ${errorMessage}`);
  }
};
