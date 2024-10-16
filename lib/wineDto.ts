import type { ScrapingResult } from '@/types';

type WineDtoProps = {
  title: string;
  year: number;
  price: number;
  comment: string;
  shelf?: number;
  column?: number;
  scraping?: ScrapingResult | null;
};

export const wineDto = ({
  title,
  year,
  price,
  comment,
  shelf,
  column,
  scraping,
}: WineDtoProps) => {
  const positionObject =
    isNotNullOrUndefined(shelf) && isNotNullOrUndefined(column)
      ? { shelf, column }
      : {};

  return {
    title,
    country: scraping?.country ?? null,
    year,
    price: price > 0 ? price : scraping?.currentPrice ?? null,
    currentPrice: scraping?.currentPrice ?? null,
    comment,
    img: scraping?.img ?? null,
    rating: scraping?.rating ?? null,
    vivinoUrl: scraping?.vivinoUrl ?? null,
    ...positionObject,
  };
};

const isNotNullOrUndefined = (value: unknown) => {
  return value !== null && value !== undefined;
};
