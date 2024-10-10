'use client';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '../ui/input';
import { FormItem } from '../ui/form';
import { useContext } from 'react';
import { SearchContext } from '@/providers/SearchProvider';

export const Search = () => {
  const { searchTerm, setSearchTerm } = useContext(SearchContext);

  return (
    <form className="w-full flex justify-center">
      <FormItem className="w-full">
        <div className="relative flex max-w-96 flex-shrink">
          <SearchIcon
            size={16}
            className={`absolute left-4 self-center opacity-50 ${
              searchTerm.length > 0 ? 'hidden' : 'visible'
            }`}
          />
          <Input
            onChange={e => setSearchTerm(e.target.value)}
            className="resize-none rounded-full"
          />
        </div>
      </FormItem>
    </form>
  );
};
