'use server';

export const getVivinoData = async ({
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
    const url = `https://www.vivino.com/sv/search/wines?q=${cleanSearchTitle}+${year}`;

    const evaluateScript = `
      (() => {
        try {
          const img = document.querySelector('.wineCard__bottleSection--3Bzic img')?.getAttribute('src');
          const rating = document.querySelector('.vivinoRating__averageValue--3p6Wp')?.textContent;
          const country = document.querySelector('.wineInfoLocation__regionAndCountry--1nEJz')?.textContent;
          const vivinoUrl = document.querySelector('.wineCard__cardLink--3F_uB')?.getAttribute('href');
          return JSON.stringify({ img, rating, country, vivinoUrl, error: null });
        } catch (e) {
          return JSON.stringify({ error: (e?.message ?? String(e)) });
        }
      })()
    `;

    const { value } = await fetchWebsiteData(url, evaluateScript);

    if (!value) {
      throw new Error('No data returned from scraping');
    }
    const parsedValue = JSON.parse(value);
    if (parsedValue.error) {
      throw new Error(`Error in scraped data: ${parsedValue.error}`);
    }

    const { img, rating, country, vivinoUrl } = parsedValue;

    return {
      img,
      rating,
      country,
      vivinoUrl: vivinoUrl ? `https://www.vivino.com${vivinoUrl}` : null,
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const fetchWebsiteData = async (
  url: string,
  evaluateScript: string
): Promise<ScrapingResponse> => {
  try {
    const TOKEN = process.env.BROWSWER_IO_KEY;
    const browserIOUrl = `https://production-sfo.browserless.io/stealth/bql?token=${TOKEN}&proxy=residential&proxyCountry=se&proxySticky=true`;
    const headers = {
      'Content-Type': 'application/json',
    };

    const query = `
      mutation MultiLineEvaluate($url: String!) {
        reject(type: [image, stylesheet, media]) {
          time
        }
        goto(url: $url) {
          status
        }
        waitForSelector(selector: ".wineCard__bottleSection--3Bzic") {
          selector  
          time  
        }
        evaluate(content: """
          ${evaluateScript}
          """) {
            value
          }
      }
    `;

    const response = await fetch(browserIOUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        query,
        variables: {
          url,
        },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      throw new Error(JSON.stringify(result.errors));
    }

    return result.data.evaluate;
  } catch (e) {
    console.error('Error fetching website data:', e);
    throw e;
  }
};

type ScrapingResponse = {
  value: string;
};
