'use server';
import type { ScrapingResult } from '@/types';
import {
  mapExploreMatch,
  type ExploreMatch,
  type ExploreResponse,
} from './mapExploreMatch';
import { pickExploreMatch } from './pickExploreMatch';
import { getVivinoPriceForVintage, getVivinoPriceForWineYear } from './getVivinoPrice';
import { pickVintageId, searchAlgoliaWines } from './searchAlgolia';
import { getSwedishVivinoSession, vivinoJsonHeaders } from './vivinoSession';
import { vivinoFetch } from './vivinoFetch';

const EXPLORE_API_URL = 'https://www.vivino.com/api/explore/explore';
const VINTAGE_API_URL = 'https://www.vivino.com/api/vintages';
const FETCH_TIMEOUT_MS = 10_000;

export const getVivinoData = async ({
  title,
  year,
}: {
  title: string;
  year: number;
}): Promise<ScrapingResult | undefined> => {
  try {
    return (
      (await getVivinoDataFromAlgolia(title, year)) ??
      (await getVivinoDataFromExploreApi(title, year))
    );
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

const getVivinoDataFromAlgolia = async (title: string, year: number) => {
  try {
    const hits = await searchAlgoliaWines(title);
    const vintageId = pickVintageId(hits[0]?.vintages, year);
    if (!vintageId) return undefined;

    const response = await vivinoFetch(
      `${VINTAGE_API_URL}/${vintageId}?language=sv`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Vivino vintage API failed: ${response.status} ${errorBody.slice(0, 300)}`
      );
    }

    const data = (await response.json()) as ExploreMatch;
    const mapped = mapExploreMatch(data);
    if (!mapped) return undefined;

    const currentPrice =
      (await getVivinoPriceForVintage(vintageId)) ??
      (typeof data.vintage?.wine?.id === 'number'
        ? await getVivinoPriceForWineYear(data.vintage.wine.id, year)
        : null);
    return {
      ...mapped,
      vintageId,
      ...(currentPrice != null ? { currentPrice } : {}),
    };
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

const getVivinoDataFromExploreApi = async (title: string, year: number) => {
  const session = await getSwedishVivinoSession();
  const params = new URLSearchParams({
    search_term: buildSearchTerm(title, year).replace(/\+/g, ' '),
    country_code: 'se',
    currency_code: 'SEK',
    language: 'sv',
    order_by: 'relevance',
    page: '1',
    per_page: '24',
  });

  const response = await vivinoFetch(`${EXPLORE_API_URL}?${params}`, {
    headers: vivinoJsonHeaders(session),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Vivino explore API failed: ${response.status} ${errorBody.slice(0, 300)}`
    );
  }

  const data = (await response.json()) as ExploreResponse;
  const match = pickExploreMatch(data.explore_vintage?.matches, title, year);
  const mapped = mapExploreMatch(match);
  if (!mapped || mapped.currentPrice != null) return mapped;
  if (match?.vintage?.id == null) return mapped;

  const currentPrice = await getVivinoPriceForVintage(match.vintage.id);
  return {
    ...mapped,
    ...(currentPrice != null ? { currentPrice } : {}),
  };
};

const buildSearchTerm = (title: string, year: number) => {
  const searchTitle = title.split(' ').join('+');
  const cleanSearchTitle = searchTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f’']/g, '');
  return `${cleanSearchTitle}+${year}`;
};
