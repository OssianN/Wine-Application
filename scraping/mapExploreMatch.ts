import type { DrinkingWindow, ScrapingResult } from '@/types';
import { toSekAmount } from './getVivinoPrice';

export const mapExploreMatch = (
  match: ExploreMatch | undefined
): ScrapingResult | undefined => {
  const vintage = match?.vintage;
  if (!vintage) return undefined;

  const wine = vintage.wine;
  const image = vintage.image;
  const rawImg =
    image?.variations?.bottle_small_square ||
    image?.variations?.bottle_medium_square ||
    image?.location;
  const regionName = wine?.region?.name?.trim();
  const countryName = wine?.region?.country?.name?.trim();
  const country = [regionName, countryName].filter(Boolean).join(', ');
  const rating = vintage.statistics?.ratings_average;
  const currentPrice = toSekAmount(
    match.price?.amount,
    match.price?.currency?.code
  );
  const drinkingWindow = mapDrinkingWindow(vintage);

  return {
    img: toHttpsUrl(rawImg),
    rating: rating == null ? undefined : String(rating),
    country: country || undefined,
    vivinoUrl: winePageUrl(vintage),
    ...(currentPrice != null ? { currentPrice } : {}),
    ...(vintage.id != null ? { vintageId: vintage.id } : {}),
    ...(drinkingWindow?.startYear != null
      ? { drinkingWindowStart: drinkingWindow.startYear }
      : {}),
    ...(drinkingWindow?.endYear != null
      ? { drinkingWindowEnd: drinkingWindow.endYear }
      : {}),
    ...(drinkingWindow?.status != null
      ? { drinkingWindowStatus: drinkingWindow.status }
      : {}),
  };
};

const mapDrinkingWindow = (
  vintage?: ExploreVintage | null
): DrinkingWindow | undefined => {
  const raw = vintage?.recommended_drinking_window;
  if (!raw) return undefined;

  const startYear = toYear(raw.start_year);
  const endYear = toYear(raw.end_year);
  const status =
    typeof raw.status === 'number' && Number.isFinite(raw.status)
      ? raw.status
      : undefined;

  if (startYear == null && endYear == null && status == null) {
    return undefined;
  }

  return {
    ...(startYear != null ? { startYear } : {}),
    ...(endYear != null ? { endYear } : {}),
    ...(status != null ? { status } : {}),
  };
};

const toYear = (value?: number | string | null) => {
  if (value == null || value === '') return undefined;
  const year = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(year) ? year : undefined;
};

const toHttpsUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  return `https://www.vivino.com${url}`;
};

const winePageUrl = (vintage: ExploreVintage): string | null => {
  const wineId = vintage.wine?.id;
  const winerySeo = vintage.wine?.winery?.seo_name;
  const wineSeo = vintage.wine?.seo_name;
  if (winerySeo && wineSeo && wineId) {
    const yearQuery = vintage.year ? `?year=${vintage.year}` : '';
    return `https://www.vivino.com/SE/sv/${winerySeo}-${wineSeo}/w/${wineId}${yearQuery}`;
  }
  if (vintage.id) {
    return `https://www.vivino.com/SE/sv/wines/${vintage.id}`;
  }
  return null;
};

type ExploreImage = {
  location?: string | null;
  variations?: {
    bottle_small_square?: string | null;
    bottle_medium_square?: string | null;
  };
};

type ExploreVintage = {
  id?: number;
  name?: string | null;
  year?: number | string | null;
  statistics?: { ratings_average?: number | null };
  recommended_drinking_window?: RecommendedDrinkingWindow | null;
  image?: ExploreImage | null;
  wine?: {
    id?: number;
    seo_name?: string | null;
    region?: {
      name?: string | null;
      country?: { name?: string | null };
    } | null;
    winery?: { seo_name?: string | null } | null;
  } | null;
};

type RecommendedDrinkingWindow = {
  start_year?: number | string | null;
  end_year?: number | string | null;
  status?: number | null;
};

type ExplorePrice = {
  amount?: number | null;
  currency?: { code?: string | null } | null;
};

export type ExploreMatch = {
  vintage?: ExploreVintage;
  price?: ExplorePrice | null;
};

export type ExploreResponse = {
  explore_vintage?: {
    matches?: ExploreMatch[];
  };
};
