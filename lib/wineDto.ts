import type { ScrapingResult } from '@/types';

type WineDtoProps = {
  title: string;
  year: number;
  price: number;
  comment: string;
  column?: number;
  shelf?: number;
  scraping?: ScrapingResult | null;
};

export const wineDto = ({
  title,
  year,
  price,
  comment,
  column,
  shelf,
  scraping,
}: WineDtoProps) => {
  const positionObject = shelf && column ? { shelf, column } : {};
  return {
    title,
    country: scraping?.country ?? null,
    year,
    price: price > 0 ? price : scraping?.averagePrice ?? null,
    comment,
    img: scraping?.img ?? null,
    rating: scraping?.rating ?? null,
    vivinoUrl: scraping?.vivinoUrl ?? null,
    ...positionObject,
  };
};
