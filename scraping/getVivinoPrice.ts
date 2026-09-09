import { getSwedishVivinoSession, vivinoJsonHeaders } from './vivinoSession';

const PRICES_API_URL = 'https://www.vivino.com/api/prices';
const CHECKOUT_PRICES_API_URL = 'https://www.vivino.com/api/wines';
const FETCH_TIMEOUT_MS = 10_000;

export const toSekAmount = (
  amount?: number | null,
  currencyCode?: string | null
): number | null => {
  if (currencyCode && currencyCode !== 'SEK') return null;
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return Math.round(amount);
};

export const parseVivinoUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const wineMatch = parsed.pathname.match(/\/w\/(\d+)/);
    const vintagePathMatch = parsed.pathname.match(/\/wines\/(\d+)/);
    const yearParam = parsed.searchParams.get('year');
    const wineId = wineMatch ? Number(wineMatch[1]) : undefined;
    const vintageId = vintagePathMatch ? Number(vintagePathMatch[1]) : undefined;
    const year = yearParam ? Number(yearParam) : undefined;
    return {
      wineId: wineId != null && Number.isFinite(wineId) ? wineId : undefined,
      vintageId:
        vintageId != null && Number.isFinite(vintageId) ? vintageId : undefined,
      year: year != null && Number.isFinite(year) ? year : undefined,
    };
  } catch {
    return {};
  }
};

type PricesResponse = {
  prices?: {
    market?: { currency?: { code?: string | null } | null };
    vintages?: Record<
      string,
      {
        vintage?: { id?: number; year?: number | string | null };
        median?: { amount?: number | null };
        price?: { amount?: number | null };
      }
    >;
  };
};

type CheckoutPricesResponse = {
  checkout_prices?: Array<{
    market?: { currency?: { code?: string | null } | null };
    availability?: {
      vintage?: { id?: number; year?: number | string | null };
      median?: { amount?: number | null };
      price?: { amount?: number | null };
    };
  }>;
};

const fetchVivinoJson = async <T>(url: string): Promise<T | null> => {
  try {
    const session = await getSwedishVivinoSession();
    const response = await fetch(url, {
      headers: vivinoJsonHeaders(session),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getVivinoPriceForVintage = async (
  vintageId: number
): Promise<number | null> => {
  if (!Number.isFinite(vintageId)) return null;

  const data = await fetchVivinoJson<PricesResponse>(
    `${PRICES_API_URL}?vintage_ids[]=${vintageId}&language=sv`
  );
  const marketCurrency = data?.prices?.market?.currency?.code;
  const entry = data?.prices?.vintages?.[String(vintageId)];
  if (!entry) return null;
  // Vivino may substitute a sibling vintage when the requested year has no listing.
  if (Number(entry.vintage?.id) !== vintageId) return null;

  return (
    toSekAmount(entry.price?.amount, marketCurrency) ??
    toSekAmount(entry.median?.amount, marketCurrency)
  );
};

export const getVivinoPriceForWineYear = async (
  wineId: number,
  year: number
): Promise<number | null> => {
  if (!Number.isFinite(wineId) || !Number.isFinite(year)) return null;

  const data = await fetchVivinoJson<CheckoutPricesResponse>(
    `${CHECKOUT_PRICES_API_URL}/${wineId}/checkout_prices?language=sv`
  );
  const wantedYear = String(year);
  const match = data?.checkout_prices?.find(
    item => String(item.availability?.vintage?.year) === wantedYear
  );
  if (!match) return null;

  const currency = match.market?.currency?.code;
  return (
    toSekAmount(match.availability?.price?.amount, currency) ??
    toSekAmount(match.availability?.median?.amount, currency)
  );
};

export const getVivinoCurrentPrice = async ({
  vintageId,
  wineId,
  year,
}: {
  vintageId?: number;
  wineId?: number;
  year?: number;
}): Promise<number | null> => {
  if (vintageId != null) {
    return getVivinoPriceForVintage(vintageId);
  }
  if (wineId != null && year != null) {
    return getVivinoPriceForWineYear(wineId, year);
  }
  return null;
};
