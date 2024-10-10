import type { Wine } from '@/types';

export type StorageDataType = {
  totalCost: number;
  averageYear: number;
  totalNumberOfBottles: number;
  averagePrice: number;
  usedSpacePercentage: number;
};

export const getStorageData = (
  wineList: Wine[],
  shelves: number,
  columns: number
): StorageDataType => {
  const { totalCost, totalYear } = wineList.reduce(
    (acc, wine) => {
      const winePrice = wine.price ? Number(wine.price) : 0;
      const wineYear = wine.year ? Number(wine.year) : 0;

      return {
        totalCost: acc.totalCost + winePrice,
        totalYear: acc.totalYear + wineYear,
      };
    },
    { totalCost: 0, totalYear: 0 }
  );

  const averageYear = Math.round(
    totalYear / wineList.filter(wine => wine.year && wine.year > 1900).length
  );

  const averagePrice = Math.round(
    totalCost / wineList.filter(wine => wine.price && wine.price > 0).length
  );

  const totalNumberOfBottles = wineList.length;

  const usedSpacePercentage =
    (totalNumberOfBottles / (shelves * columns)) * 100;

  return {
    totalCost,
    totalNumberOfBottles,
    averageYear,
    averagePrice,
    usedSpacePercentage,
  };
};
