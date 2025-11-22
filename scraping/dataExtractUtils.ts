'use server';
import type { Page } from 'puppeteer-core';

export const getWineCountry = async (page: Page) => {
  try {
    await page.waitForSelector('.wineInfoLocation__regionAndCountry--1nEJz', {
      timeout: 5000,
    });
    const countryElement = await page.$(
      '.wineInfoLocation__regionAndCountry--1nEJz'
    );

    if (!countryElement) return 'No country found';

    const text = await countryElement.evaluate(el => el.textContent?.trim());

    const [region, country] = text.split(',').map(part => part.trim());

    return `${region}, ${country}`;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getWineImg = async (page: Page) => {
  try {
    await page.waitForSelector('.wineLabel-module__image--3HOnd', {
      timeout: 5000,
    });
    const imageElement = await page.$('.wineLabel-module__image--3HOnd');
    return imageElement
      ? await imageElement.evaluate(el => el.getAttribute('src'))
      : null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getWineRating = async (page: Page) => {
  try {
    await page.waitForSelector('.vivinoRating_averageValue__uDdPM', {
      timeout: 5000,
    });
    const ratingElement = await page.$('.vivinoRating_averageValue__uDdPM');
    return (
      (await ratingElement?.evaluate(el => el.textContent?.trim())) ??
      'no rating found'
    );
  } catch (e) {
    console.error(e);
    return 'no rating found';
  }
};

export const getCurrentPriceOfWine = async (page: Page) => {
  try {
    await page.waitForSelector(
      '.purchaseAvailabilityPPC__betterValueSentence--3OMTX',
      { timeout: 5000 }
    );
    const priceElement = await page.$(
      '.purchaseAvailabilityPPC__betterValueSentence--3OMTX'
    );

    if (!priceElement) return undefined;

    const priceText = await priceElement.evaluate(el => el.textContent?.trim());

    if (!priceText || isNaN(Number(priceText))) return undefined;

    return priceText;
  } catch (e) {
    console.error(e);
    return undefined;
  }
};
