import type { Wine } from '@/types';

export type StorageDataType = {
  totalCost: number;
  averageYear: number;
  totalNumberOfBottles: number;
  averagePrice: number;
};

export const getStorageData = (wineList: Wine[]): StorageDataType => {
  const { totalCost, totalYear } = wineList.reduce(
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
    totalYear / wineList.filter(wine => !isNaN(wine.year)).length;

  const averagePrice =
    totalCost / wineList.filter(wine => wine.price > 0).length;

  const totalNumberOfBottles = wineList.length;

  return { totalCost, totalNumberOfBottles, averageYear, averagePrice };
};
