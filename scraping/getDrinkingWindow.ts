import type { ExploreMatch } from './mapExploreMatch';
import { mapExploreMatch } from './mapExploreMatch';
import { vivinoFetch } from './vivinoFetch';

const VINTAGE_API_URL = 'https://www.vivino.com/api/vintages';
const FETCH_TIMEOUT_MS = 10_000;

export type DrinkingWindowResult = {
  drinkingWindowStart?: number | null;
  drinkingWindowEnd?: number | null;
  drinkingWindowStatus?: number | null;
};

export const getDrinkingWindowForVintage = async (
  vintageId: number
): Promise<DrinkingWindowResult | undefined> => {
  if (!Number.isFinite(vintageId) || vintageId <= 0) return undefined;

  try {
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
    if (!response.ok) return undefined;
    const data = (await response.json()) as ExploreMatch;
    const mapped = mapExploreMatch(data);
    if (
      mapped?.drinkingWindowStart == null &&
      mapped?.drinkingWindowEnd == null &&
      mapped?.drinkingWindowStatus == null
    ) {
      return undefined;
    }
    return {
      drinkingWindowStart: mapped?.drinkingWindowStart,
      drinkingWindowEnd: mapped?.drinkingWindowEnd,
      drinkingWindowStatus: mapped?.drinkingWindowStatus,
    };
  } catch (e) {
    console.error(e);
    return undefined;
  }
};
