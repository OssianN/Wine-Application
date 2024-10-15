import { load } from 'cheerio';
import { getWinePageUrl } from './cheerio';
import { getHtmlFromTitle } from './getHtmlFromInput';

export const getAverageWinePrice = async ({
  title,
  year,
  link,
}: {
  title: string;
  year: number;
  link: string | null;
}) => {
  try {
    const wineLink = link?.includes('/SE/sv')
      ? link
      : await getLinkFromHtml({ title, year });

    if (!wineLink) return null;

    const vivinoLinkSite = await fetch(wineLink);
    const body = await vivinoLinkSite.text();
    const wineHtml = load(body);

    const currentPrice = (
      wineHtml('span.purchaseAvailability__currentPrice--3mO4u')?.[0]
        ?.children?.[0] as unknown as Text
    )?.data as string;

    const averagePrice = (
      wineHtml('span.purchaseAvailabilityPPC__amount--2_4GT')?.[0]
        ?.children?.[0] as unknown as Text
    )?.data as string;

    const priceString = currentPrice ?? averagePrice;
    if (!priceString) return null;

    const priceNumber = Number(priceString?.split(' kr')[0]);

    if (isNaN(priceNumber)) return null;

    return Math.floor(priceNumber);
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
