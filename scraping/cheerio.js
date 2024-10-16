import * as cheerio from 'cheerio';
import { getCurrentValueOfWine } from './getCurrentValueOfWine';

const getHtmlFromTitle = async (title, year) => {
  try {
    const searchTitle = title.split(' ').join('+');
    const cleanSearchTitle = searchTitle
      .normalize('NFD')
      .replace(/[\u0300-\u036f’]/g, '');

    const vivinoSite = await fetch(
      `https://www.vivino.com/search/wines?q=${cleanSearchTitle}+${year}`
    );
    const body = await vivinoSite.text();
    return cheerio.load(body);
  } catch (e) {
    console.error(e);
    return null;
  }
};

const getWineCountry = html => {
  try {
    const countryElement = html('.wine-card__region');
    const firstCountry = countryElement[0];
    const region = firstCountry.children[3].children[0].data;
    const country = firstCountry.children[5].children[0].data;
    return `${region}, ${country}`;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const getWineImg = html => {
  try {
    const imgElement = html('.wine-card__image');
    const firstImg = imgElement[0];
    const attribute = firstImg.attribs.style;
    return attribute.match(/\/\/.*(?=\))/);
  } catch (e) {
    console.error(e);
    return null;
  }
};

const getWineRating = html => {
  try {
    const ratingElement = html('.average__number');
    return ratingElement[0].children[0].data;
  } catch (e) {
    console.error(e);
    return 'no rating found';
  }
};

export const getWinePageUrl = async html => {
  try {
    const winePage = html('.wine-card__image-wrapper')[0].children[0].next
      .attribs.href;
    const wineId = winePage.split('/').at(-1);

    return `https://www.vivino.com/SE/sv/wines/${wineId}`;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const getVivinoData = async (title, year) => {
  try {
    const html = await getHtmlFromTitle(title, year);
    if (!html) {
      return null;
    }

    const [imgURL, rating, country, vivinoUrl] = await Promise.all([
      getWineImg(html),
      getWineRating(html),
      getWineCountry(html),
      getWinePageUrl(html),
    ]);
    const currentValue = await getCurrentValueOfWine({ link: vivinoUrl });

    return { img: imgURL[0], rating, country, vivinoUrl, currentValue };
  } catch (e) {
    console.error(e);
  }
};

export default getVivinoData;
