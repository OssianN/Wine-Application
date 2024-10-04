import { Wine } from '@/types';
import { useMemo } from 'react';

export const useWineList = (
  wineList: Wine[],
  searchTerm: string,
  isArchived?: boolean
) =>
  useMemo(
    () =>
      wineList
        .filter(
          wine =>
            !!wine.archived === !!isArchived &&
            wine.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          if (`${a.shelf}${a.column}` < `${b.shelf}${b.column}`) return -1;
          if (`${a.shelf}${a.column}` > `${b.shelf}${b.column}`) return 1;
          return 0;
        }),
    [isArchived, searchTerm, wineList]
  );
