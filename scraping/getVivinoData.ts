'use server';
import type { Browser, Page } from 'puppeteer-core';
import { getCurrentPriceOfWine, getWineImg } from './dataExtractUtils';
import { getChromiumPath } from './setupChromium';

export const getVivinoData = async ({ title }: { title: string }) => {
  try {
    const searchTitle = title.split(' ').join('+');
    const cleanSearchTitle = searchTitle
      .normalize('NFD')
      .replace(/[\u0300-\u036f’]/g, '');

    const browser = (await startBrowser()) as Browser;

    const searchPage = await browser.newPage();
    await configurePageSettings(searchPage as Page);

    await searchPage.goto(
      `https://www.systembolaget.se/sortiment/?q=${cleanSearchTitle}`,
      {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      }
    );

    await searchPage.waitForSelector('#stock_scrollcontainer', {
      timeout: 10000,
    });

    const [img, currentPrice] = await Promise.all([
      getWineImg(searchPage),
      getCurrentPriceOfWine(searchPage),
    ]);

    browser.close();

    return {
      img,
      currentPrice,
      rating: null,
      country: null,
      winePageUrl: null,
    };
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
