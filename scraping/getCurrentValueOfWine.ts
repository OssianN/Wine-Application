'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { load } from 'cheerio';
import { getWinePageUrl } from './cheerio';
import { getHtmlFromTitle } from './getHtmlFromInput';
import { updateCurrentValueInDb } from '@/mongoDB/updateCurrentValue';

export const getCurrentValueOfWine = async ({
  wineId,
  title,
  year,
  link,
}: {
  title: string;
  year: number;
  link: string | null;
  wineId?: string | null;
}) => {
  try {
    const wineLink = link?.includes('/SE/sv')
      ? link
      : await getLinkFromHtml({ title, year });

    if (!wineLink) return null;

    const vivinoLinkSite = await fetch(wineLink);
    const body = await vivinoLinkSite.text();

    const currentPriceString = getData(
      body,
      'span.purchaseAvailability__currentPrice--3mO4u'
    );

    const averagePriceString = getData(
      body,
      'span.purchaseAvailabilityPPC__amount--2_4GT'
    );

    const priceString = currentPriceString ?? averagePriceString;
    if (!priceString) return null;

    const priceNumber = Number(priceString?.split(' kr')[0]);

    if (isNaN(priceNumber)) return null;

    const currentValue = Math.floor(priceNumber);

    if (wineId) {
      updateCurrentValueInDb(wineId, currentValue);
    }

    return currentValue;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const getLinkFromHtml = async ({
  title,
  year,
}: {
  title: string;
  year: number;
}) => {
  const html = await getHtmlFromTitle({ title, year });
  return await getWinePageUrl(html);
};

const getData = (body: string, selector: string) => {
  const wineHtml = load(body);

  return (wineHtml(selector)?.[0] as any)?.children?.[0]?.data as string;
};
