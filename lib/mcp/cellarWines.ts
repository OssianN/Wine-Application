import type { Wine } from '@/types';

export type CellarWine = {
  title: string;
  year: number;
  country: string;
  rating: string;
  price: number | null;
  currentPrice?: number | null;
  comment: string | null;
  shelf: number;
  column: number;
  archived: boolean;
  vivinoUrl: string | null;
  drinkingWindowStart?: number | null;
  drinkingWindowEnd?: number | null;
  drinkingWindowStatus?: number | null;
};

export const cellarWineFromDocument = (wine: Wine): CellarWine => ({
  title: wine.title,
  year: wine.year,
  country: wine.country,
  rating: wine.rating,
  price: wine.price,
  currentPrice: wine.currentPrice ?? null,
  comment: wine.comment,
  shelf: wine.shelf,
  column: wine.column,
  archived: !!wine.archived,
  vivinoUrl: wine.vivinoUrl,
  drinkingWindowStart: wine.drinkingWindowStart ?? null,
  drinkingWindowEnd: wine.drinkingWindowEnd ?? null,
  drinkingWindowStatus: wine.drinkingWindowStatus ?? null,
});
