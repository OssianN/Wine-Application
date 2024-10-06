import { WineContext } from '@/providers/WineProvider';
import { Wine } from '@/types';
import { set } from 'mongoose';
import { useContext, useEffect, useMemo } from 'react';

export const useWineList = (
  wineList: Wine[],
  searchTerm: string,
  isArchived?: boolean
) => {
  const { setWineList } = useContext(WineContext);
  const filteredList = useMemo(
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

  useEffect(() => {
    setWineList(filteredList);
  }, [filteredList, setWineList]);

  return filteredList;
};
