import { vivinoVintageIdFromUrl, vivinoWineIdFromUrl } from '@/lib/utils';
import {
  nonNullVivinoDetails,
  type VivinoDetailsFields,
  type WineVivinoDetailsUpdate,
} from '@/lib/vivinoDetails';
import type { VivinoDetails } from './getVivinoDetails';
import { getVivinoDetailsForWine } from './getVivinoDetails';
import { getDrinkingWindowForVintage } from './getDrinkingWindow';
import { getVivinoPricesForVintages } from './getVivinoPrice';

const DRINKING_WINDOW_CONCURRENCY = 3;
const DETAILS_CONCURRENCY = 3;

export type RefreshableWine = {
  _id: string;
  title?: string | null;
  year?: number | null;
  vintageId?: number | null;
  vivinoUrl?: string | null;
  archived?: boolean | null;
};

export type RefreshVivinoDetailsResult = {
  updated: number;
  skipped: number;
  failed: number;
  updates: WineVivinoDetailsUpdate[];
};

const emptyDetails = (): VivinoDetails => ({
  price: null,
  vintageId: null,
  drinkingWindowStart: null,
  drinkingWindowEnd: null,
  drinkingWindowStatus: null,
});

const isPositiveInt = (value?: number | null): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

const hasRefreshIdentity = (
  wineId: number | null,
  year: number | null,
  vintageId: number | null,
  title?: string | null
) =>
  isPositiveInt(vintageId) ||
  (isPositiveInt(wineId) && year != null && Number.isFinite(year)) ||
  (Boolean(title?.trim()) && year != null && Number.isFinite(year));

const resolveWineIds = (wine: RefreshableWine) => {
  const wineId = vivinoWineIdFromUrl(wine.vivinoUrl);
  const vintageId = isPositiveInt(wine.vintageId)
    ? wine.vintageId
    : vivinoVintageIdFromUrl(wine.vivinoUrl);
  const year =
    wine.year != null && Number.isFinite(Number(wine.year))
      ? Number(wine.year)
      : null;
  return { wineId, vintageId, year };
};

const detailsFromVivino = (details: VivinoDetails): VivinoDetailsFields => ({
  currentPrice: details.price,
  vintageId: details.vintageId,
  drinkingWindowStart: details.drinkingWindowStart,
  drinkingWindowEnd: details.drinkingWindowEnd,
  drinkingWindowStatus: details.drinkingWindowStatus,
});

const toUpdate = (
  wineId: string,
  details: VivinoDetailsFields
): WineVivinoDetailsUpdate | null => {
  const $set = nonNullVivinoDetails(details);
  if (Object.keys($set).length === 0) return null;
  return { wineId, ...$set };
};

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) return [];
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (true) {
        const index = nextIndex++;
        if (index >= items.length) return;
        results[index] = await mapper(items[index]);
      }
    })
  );
  return results;
}

const refreshWinesWithVintageId = async (
  wines: Array<RefreshableWine & { vintageId: number }>
): Promise<Array<WineVivinoDetailsUpdate | 'failed' | null>> => {
  const vintageIds = wines.map(wine => wine.vintageId);
  let prices = new Map<number, number>();
  try {
    prices = await getVivinoPricesForVintages(vintageIds);
  } catch (e) {
    console.error(e);
  }

  return mapPool(wines, DRINKING_WINDOW_CONCURRENCY, async wine => {
    try {
      const window = await getDrinkingWindowForVintage(wine.vintageId);
      return toUpdate(wine._id, {
        currentPrice: prices.get(wine.vintageId) ?? null,
        drinkingWindowStart: window?.drinkingWindowStart ?? null,
        drinkingWindowEnd: window?.drinkingWindowEnd ?? null,
        drinkingWindowStatus: window?.drinkingWindowStatus ?? null,
      });
    } catch (e) {
      console.error(e);
      const update = toUpdate(wine._id, {
        currentPrice: prices.get(wine.vintageId) ?? null,
      });
      return update ?? 'failed';
    }
  });
};

const refreshWinesWithoutVintageId = async (
  wines: Array<
    RefreshableWine & {
      wineId: number | null;
      year: number | null;
    }
  >
): Promise<Array<WineVivinoDetailsUpdate | 'failed' | null>> =>
  mapPool(wines, DETAILS_CONCURRENCY, async wine => {
    try {
      const details = await getVivinoDetailsForWine({
        wineId: wine.wineId,
        year: wine.year,
        vintageId: null,
        title: wine.title,
      });
      return toUpdate(wine._id, detailsFromVivino(details ?? emptyDetails()));
    } catch (e) {
      console.error(e);
      return 'failed';
    }
  });

export const refreshVivinoDetailsForWines = async (
  wines: RefreshableWine[]
): Promise<RefreshVivinoDetailsResult> => {
  const withVintageId: Array<RefreshableWine & { vintageId: number }> = [];
  const withoutVintageId: Array<
    RefreshableWine & { wineId: number | null; year: number | null }
  > = [];
  let skipped = 0;

  for (const wine of wines) {
    if (wine.archived) {
      skipped += 1;
      continue;
    }
    const ids = resolveWineIds(wine);
    if (!hasRefreshIdentity(ids.wineId, ids.year, ids.vintageId, wine.title)) {
      skipped += 1;
      continue;
    }
    if (isPositiveInt(ids.vintageId)) {
      withVintageId.push({ ...wine, vintageId: ids.vintageId });
      continue;
    }
    withoutVintageId.push({
      ...wine,
      wineId: ids.wineId,
      year: ids.year,
    });
  }

  const [vintageResults, detailsResults] = await Promise.all([
    refreshWinesWithVintageId(withVintageId),
    refreshWinesWithoutVintageId(withoutVintageId),
  ]);

  const updates: WineVivinoDetailsUpdate[] = [];
  let failed = 0;
  for (const result of [...vintageResults, ...detailsResults]) {
    if (result === 'failed') {
      failed += 1;
      continue;
    }
    if (result == null) {
      skipped += 1;
      continue;
    }
    updates.push(result);
  }

  return {
    updated: updates.length,
    skipped,
    failed,
    updates,
  };
};
