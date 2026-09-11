import { searchWines } from '@/lib/searchWines';
import type { Wine } from '@/types';
import { useMemo } from 'react';

export const useWineList = (wineList: Wine[], searchTerm: string) =>
  useMemo(() => searchWines(wineList, searchTerm), [searchTerm, wineList]);
