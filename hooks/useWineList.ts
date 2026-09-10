import { searchWines } from '@/lib/searchWines';
import { WineContext } from '@/providers/WineProvider';
import { Wine } from '@/types';
import { useContext, useEffect, useMemo } from 'react';

export const useWineList = (wineList: Wine[], searchTerm: string) => {
  const { setWineList } = useContext(WineContext);
  const filteredList = useMemo(
    () => searchWines(wineList, searchTerm),
    [searchTerm, wineList]
  );

  useEffect(() => {
    setWineList(filteredList);
  }, [filteredList, setWineList]);

  return filteredList;
};
