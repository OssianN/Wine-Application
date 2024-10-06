import type { Wine } from '@/types';

export const getStorageData = (wineList: Wine[]) => {
  const { totalCost, totalYear } = wineList
    .filter(wine => !wine.archived)
    .reduce(
      (acc, wine) => {
        const winePrice = !isNaN(wine.price) ? Number(wine.price) : 0;
        const wineYear = !isNaN(wine.year) ? Number(wine.year) : 0;
        return {
          totalCost: acc.totalCost + winePrice,
          totalYear: acc.totalYear + wineYear,
        };
      },
      { totalCost: 0, totalYear: 0 }
    );

  const averageYear =
    totalYear / wineList.filter(wine => wine.year > 1900).length;

  const averagePrice =
    totalCost / wineList.filter(wine => wine.price > 0).length;

  return { totalCost, averageYear, averagePrice };
};
