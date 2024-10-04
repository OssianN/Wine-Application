'use client';
import { useContext, useMemo } from 'react';
import { WineCard } from './WineCard';
import { AddWineCard } from './AddWineCard';
import { SearchContext } from '@/providers/SearchProvider';
import type { User, Wine } from '@/types';
import { useWineList } from '@/hooks/useWineList';

type WineGridProps = {
  data: Wine[];
  user: User;
};

export const WineGrid = ({ data, user }: WineGridProps) => {
  const { searchTerm } = useContext(SearchContext);
  const wineList = useWineList(data, searchTerm);

  const getEmptySlots = useMemo(() => {
    const allSlots = [];
    const wineSlots = wineList.map(wine => {
      return `${wine.shelf}:${wine.column}`;
    });

    for (let i = 0; i < user.shelves; i++) {
      for (let j = 0; j < user.columns; j++) {
        allSlots.push(`${i}:${j}`);
      }
    }

    return allSlots.filter(slot => !wineSlots.includes(slot));
  }, [user.columns, user.shelves, wineList]);

  return (
    <div className="w-full overflow-x-scroll">
      <div
        className="grid gap-4 py-8"
        style={{
          gridTemplateColumns: `repeat(${user.columns}, minmax(0, 1fr))`,
          minWidth: `calc(8rem * ${user.columns} + 7rem)`,
        }}
      >
        {wineList.map(wine => {
          return <WineCard key={wine._id} wine={wine} />;
        })}
        {!searchTerm &&
          getEmptySlots.map(id => <AddWineCard key={id} id={id} />)}
      </div>
    </div>
  );
};
