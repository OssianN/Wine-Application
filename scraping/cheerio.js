import * as cheerio from 'cheerio';

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

const getAverageWinePrice = async html => {
  try {
    const winePage = html('.wine-card__image-wrapper')[0].children[0].next
      .attribs.href;
    const vivinoLinkSite = await fetch(`https://www.vivino.com${winePage}`);
    const body = await vivinoLinkSite.text();
    const wineHtml = cheerio.load(body);

    const priceText = wineHtml('span.purchaseAvailabilityPPC__amount--2_4GT')[0]
      .children[0].data;
    const priceNumber = priceText.split(' kr')[0];

    if (isNaN(priceNumber)) return null;

    return Math.floor(priceNumber);
  } catch (e) {
    console.error(e);
    return null;
  }
};

const getWinePageUrl = async html => {
  try {
    const winePage = html('.wine-card__image-wrapper')[0].children[0].next
      .attribs.href;
    return `https://www.vivino.com${winePage}`;
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

    const [imgURL, rating, country, vivinoUrl, averagePrice] =
      await Promise.all([
        getWineImg(html),
        getWineRating(html),
        getWineCountry(html),
        getWinePageUrl(html),
        getAverageWinePrice(html),
      ]);

    return { img: imgURL[0], rating, country, vivinoUrl, averagePrice };
  } catch (e) {
    console.error(e);
  }
};

export default getVivinoData;
