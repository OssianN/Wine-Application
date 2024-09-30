'use client';
import { createContext, useState } from 'react';
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

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
