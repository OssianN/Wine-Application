import type { ScrapingResult } from '@/types';

type WineDtoProps = {
  title: string;
  year: number;
  price?: number;
  comment?: string;
  scraping?: ScrapingResult | null;
};

export const wineDto = ({
  title,
  year,
  price,
  comment,
  scraping,
}: WineDtoProps) => {
  return {
    title,
    country: scraping?.country ?? null,
    year,
    price: price && price > 0 ? price : scraping?.currentPrice ?? null,
    currentPrice: scraping?.currentPrice ?? null,
    comment,
    img: scraping?.img ?? null,
    rating: scraping?.rating ?? null,
    vivinoUrl: scraping?.vivinoUrl ?? null,
  };
};
