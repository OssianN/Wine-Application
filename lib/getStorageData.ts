import type { Wine } from '@/types';

export type StorageDataType = {
  totalCost: number;
  totalValue: number;
  averageYear: number;
  totalNumberOfBottles: number;
  averagePrice: number;
  usedSpacePercentage: number;
  costDifferencePercentage: number;
};

export const getStorageData = (
  wineList: Wine[],
  shelves: number,
  columns: number
): StorageDataType => {
  const { totalCost, totalValue, totalYear } = wineList.reduce(
    (acc, wine) => {
      const winePrice = wine.price ? Number(wine.price) : 0;
      const wineCurrentPrice = wine.currentPrice
        ? Number(wine.currentPrice)
        : winePrice;
      const wineYear = wine.year ? Number(wine.year) : 0;

      return {
        totalCost: acc.totalCost + winePrice,
        totalValue: acc.totalValue + wineCurrentPrice,
        totalYear: acc.totalYear + wineYear,
      };
    },
    { totalCost: 0, totalValue: 0, totalYear: 0 }
  );

  const averageYear = Math.round(
    totalYear / wineList.filter(wine => wine.year && wine.year > 0).length
  );

  const averagePrice = Math.round(
    totalCost / wineList.filter(wine => wine.price && wine.price > 0).length
  );

  const totalNumberOfBottles = wineList.length;

  const usedSpacePercentage =
    (totalNumberOfBottles / (shelves * columns)) * 100;

  const costDifferencePercentage = Math.round(
    ((totalValue - totalCost) / totalCost) * 100
  );

  return {
    totalCost,
    totalValue,
    totalNumberOfBottles,
    averageYear,
    averagePrice,
    usedSpacePercentage,
    costDifferencePercentage,
  };
};
