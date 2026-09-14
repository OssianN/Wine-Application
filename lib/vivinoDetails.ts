export type VivinoDetailsFields = {
  currentPrice?: number | null;
  vintageId?: number | null;
  drinkingWindowStart?: number | null;
  drinkingWindowEnd?: number | null;
  drinkingWindowStatus?: number | null;
};

export type WineVivinoDetailsUpdate = VivinoDetailsFields & {
  wineId: string;
};

export const nonNullVivinoDetails = (details: VivinoDetailsFields) =>
  Object.fromEntries(
    Object.entries(details).filter(([, value]) => value != null)
  ) as VivinoDetailsFields;
