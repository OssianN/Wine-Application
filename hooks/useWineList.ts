import { WineContext } from '@/providers/WineProvider';
import { Wine } from '@/types';
import { useContext, useEffect, useMemo } from 'react';

export const useWineList = (wineList: Wine[], searchTerm: string) => {
  const { setWineList } = useContext(WineContext);
  const filteredList = useMemo(
    () =>
      wineList
        .filter(wine =>
          wine.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          if (`${a.shelf}${a.column}` < `${b.shelf}${b.column}`) return -1;
          if (`${a.shelf}${a.column}` > `${b.shelf}${b.column}`) return 1;
          return 0;
        }),
    [, searchTerm, wineList]
  );

  useEffect(() => {
    setWineList(filteredList);
  }, [filteredList, setWineList]);

  return filteredList;
};
