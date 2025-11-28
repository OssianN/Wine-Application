'use server';
import type { Page } from 'puppeteer-core';

export const getWineCountry = async (page: Page) => {
  try {
    return page.evaluate(() =>
      Array.from(document.querySelectorAll('img'), el => el.getAttribute('src'))
    );
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getWineImg = async (page: Page) => {
  try {
    const images = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img'), (el: HTMLElement) =>
        el.getAttribute('src')
      )
    );
    return images[2];
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
    const price = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll('.sans-strong-175.shrink-0'), el =>
          el.innerHTML.replace(':-', '').trim()
        )[2]
    );

    return isNaN(Number(price)) ? null : Number(price);
  } catch (e) {
    console.error(e);
    return undefined;
  }
};
