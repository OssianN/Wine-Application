import { getSwedishVivinoSession, vivinoJsonHeaders } from './vivinoSession';
import { vivinoFetch } from './vivinoFetch';

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
    const response = await vivinoFetch(url, {
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
  const wantedYear = Number(year);
  const listings = (data?.checkout_prices ?? [])
    .map(item => ({
      year: Number(item.availability?.vintage?.year),
      amount:
        toSekAmount(
          item.availability?.price?.amount,
          item.market?.currency?.code
        ) ??
        toSekAmount(
          item.availability?.median?.amount,
          item.market?.currency?.code
        ),
    }))
    .filter(
      (item): item is { year: number; amount: number } =>
        item.amount != null && Number.isFinite(item.year)
    );

  const exact = listings.find(item => item.year === wantedYear);
  if (exact) return exact.amount;
  if (!listings.length) return null;

  return listings.sort(
    (a, b) => Math.abs(a.year - wantedYear) - Math.abs(b.year - wantedYear)
  )[0].amount;
};
