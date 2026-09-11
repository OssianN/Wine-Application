'use client';
import { createContext, useMemo, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

export const SearchContext = createContext<{
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}>({
  searchTerm: '',
  setSearchTerm: () => {},
});

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const value = useMemo(
    () => ({ searchTerm, setSearchTerm }),
    [searchTerm]
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
