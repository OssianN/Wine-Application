import { pickVintageId, searchAlgoliaWines } from './searchAlgolia';
import { getDrinkingWindowForVintage } from './getDrinkingWindow';
import { getCheckoutForWineYear, getVivinoPriceForVintage } from './getVivinoPrice';

export type VivinoDetails = {
  price: number | null;
  vintageId: number | null;
  drinkingWindowStart: number | null;
  drinkingWindowEnd: number | null;
  drinkingWindowStatus: number | null;
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

const vintageIdFromAlgolia = async (
  title: string,
  year: number,
  wineId?: number | null
) => {
  try {
    const hits = await searchAlgoliaWines(title);
    const hit = isPositiveInt(wineId)
      ? hits.find(item => item.id === wineId) ?? hits[0]
      : hits[0];
    return pickVintageId(hit?.vintages, year) ?? null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getVivinoDetailsForWine = async ({
  wineId,
  year,
  vintageId,
  title,
}: {
  wineId?: number | null;
  year?: number | null;
  vintageId?: number | null;
  title?: string | null;
}): Promise<VivinoDetails> => {
  const details = emptyDetails();
  details.vintageId = isPositiveInt(vintageId) ? vintageId : null;

  if (isPositiveInt(wineId) && year != null && Number.isFinite(year)) {
    const checkout = await getCheckoutForWineYear(wineId, year);
    details.price = checkout.price;
    if (details.vintageId == null) details.vintageId = checkout.vintageId;
  }

  if (
    details.vintageId == null &&
    title &&
    year != null &&
    Number.isFinite(year)
  ) {
    details.vintageId = await vintageIdFromAlgolia(title, year, wineId);
  }

  if (details.price == null && isPositiveInt(details.vintageId)) {
    details.price = await getVivinoPriceForVintage(details.vintageId);
  }

  if (!isPositiveInt(details.vintageId)) return details;

  const window = await getDrinkingWindowForVintage(details.vintageId);
  details.drinkingWindowStart = window?.drinkingWindowStart ?? null;
  details.drinkingWindowEnd = window?.drinkingWindowEnd ?? null;
  details.drinkingWindowStatus = window?.drinkingWindowStatus ?? null;
  return details;
};
