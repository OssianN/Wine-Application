const ALGOLIA_APP_ID = '9TAKGWJUXL';
const ALGOLIA_SEARCH_KEY = '60c11b2f1068885161d95ca068d3a6ae';
const ALGOLIA_INDEX = 'WINES_prod';
const FETCH_TIMEOUT_MS = 10_000;

export type AlgoliaVintage = {
  id?: number;
  year?: string | number | null;
  name?: string | null;
};

export type AlgoliaWineHit = {
  id?: number;
  name?: string | null;
  vintages?: AlgoliaVintage[];
};

type AlgoliaSearchResponse = {
  hits?: AlgoliaWineHit[];
};

export const searchAlgoliaWines = async (
  query: string
): Promise<AlgoliaWineHit[]> => {
  const response = await fetch(
    `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Algolia-Application-Id': ALGOLIA_APP_ID,
        'X-Algolia-API-Key': ALGOLIA_SEARCH_KEY,
      },
      body: JSON.stringify({ query, hitsPerPage: 6 }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Vivino Algolia search failed: ${response.status} ${errorBody.slice(0, 300)}`
    );
  }

  const data = (await response.json()) as AlgoliaSearchResponse;
  return data.hits ?? [];
};

export const pickVintageId = (
  vintages: AlgoliaVintage[] | undefined,
  year: number
) => {
  const wanted = String(year);
  return vintages?.find((vintage) => String(vintage.year) === wanted)?.id;
};
