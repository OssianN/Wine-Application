import * as cheerio from 'cheerio';

const getHtmlFromTitle = (title, year) => {
  return new Promise(async (resolve, reject) => {
    try {
      const searchTitle = title.split(' ').join('+');
      const cleanSearchTitle = searchTitle
        .normalize('NFD')
        .replace(/[\u0300-\u036f’]/g, '');

      const vivinoSite = await fetch(
        `https://www.vivino.com/search/wines?q=${cleanSearchTitle}+${year}`
      );
      const body = await vivinoSite.text();
      resolve(cheerio.load(body));
    } catch (err) {
      reject(err);
    }
  });
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

const getWinePage = async html => {
  try {
    const winePage = html('.wine-card__image-wrapper')[0].children[0].next
      .attribs.href;
    const vivinoLinkSite = await fetch(`https://www.vivino.com${winePage}`);
    const body = await vivinoLinkSite.text();
    const wineHtml = cheerio.load(body);
    return wineHtml('link')[32].attribs.href;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const getVivinoData = async (title, year) => {
  try {
    const html = await getHtmlFromTitle(title, year);
    const imgURL = await getWineImg(html);
    const rating = await getWineRating(html);
    const country = await getWineCountry(html);
    const vivinoUrl = await getWinePage(html);

    return { img: imgURL[0], rating, country, vivinoUrl };
  } catch (e) {
    console.error(e);
  }
};

export default getVivinoData;
