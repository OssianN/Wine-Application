'use server';
import puppeteer, { type Page } from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

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

    const browser = await startBrowser();

    const searchPage = await browser.newPage();
    await configurePageSettings(searchPage);

    searchPage.setDefaultNavigationTimeout(60000);
    searchPage.setDefaultTimeout(60000);

    await searchPage.goto(
      `https://www.vivino.com/sv/search/wines?q=${cleanSearchTitle}+${year}`,
      { waitUntil: 'domcontentloaded', timeout: 60000 }
    );
    await new Promise(resolve =>
      setTimeout(resolve, Math.random() * 1500 + 500)
    );

    const wineAnchor = await searchPage.$('.anchor_anchor__m8Qi-');
    const href = await wineAnchor?.evaluate(el => {
      return el.getAttribute('href');
    });

    if (!href) {
      await browser.close();
      return undefined;
    }

    const winePageUrl = `https://www.vivino.com${href.replace('/en', '/sv')}`;

    const winePage = await browser.newPage();
    await configurePageSettings(winePage);

    winePage.setDefaultNavigationTimeout(60000);
    winePage.setDefaultTimeout(60000);

    await winePage.goto(winePageUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await new Promise(resolve =>
      setTimeout(resolve, Math.random() * 1500 + 500)
    );

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
    const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;
    const executablePath =
      process.env.CHROME_EXECUTABLE_PATH ||
      (await chromium.executablePath(
        'https://drive.google.com/drive/folders/1wGhDVZLh1Pt2OaB-M2-9DdYsXc7Xasam?usp=share_link'
      ));

    const browser = await puppeteer.launch({
      args: isLocal
        ? puppeteer.defaultArgs()
        : [
            ...chromium.args,
            '--hide-scrollbars',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-first-run',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-ipc-flooding-protection',
            '--single-process',
          ],
      executablePath,
      headless: true,
      timeout: 60000,
    });

    return browser;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Browser launch failed: ${errorMessage}`);
  }
};
