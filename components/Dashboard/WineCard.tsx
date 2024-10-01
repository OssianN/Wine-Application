import Image from 'next/image';
import { useContext } from 'react';
import { WineDetailsDialogContext } from '@/providers/WineDetailsDialogProvider';
import type { Wine } from '@/types';
import { SearchContext } from '@/providers/SearchProvider';
import { BlueBackground } from '../ui/blue-light-background';

type WineCardProps = {
  wine: Wine;
};

export const WineCard = ({ wine }: WineCardProps) => {
  const { handleOpenWineDialog } = useContext(WineDetailsDialogContext);
  const { searchTerm } = useContext(SearchContext);

  return (
    <article
      key={wine._id}
      id={wine._id}
      className="flex flex-col items-center text-center gap-2 rounded-md min-w-32 p-4 relative overflow-hidden cursor-pointer shadow-sm group"
      style={{
        gridRow: !searchTerm ? wine.shelf + 1 : undefined,
        gridColumn: !searchTerm ? wine.column + 1 : undefined,
      }}
      onClick={() => handleOpenWineDialog(wine)}
    >
      <p className="absolute top-4 left-4 text-neutral-500 text-sm">
        <span>{wine.shelf + 1}</span>:<span>{wine.column + 1}</span>
      </p>

      <BlueBackground />

      <Image
        key={wine._id}
        width={200}
        height={200}
        src={`https:${wine.img}`}
        alt={wine.title}
        className="drop-shadow-2xl group-hover:drop-shadow-none group-hover:scale-110 transition-all duration-500"
      />

      <h3 className="text-l truncate w-full pt-2">{wine.title}</h3>
      <p className="text-sm truncate w-full text-neutral-500">{wine.country}</p>
    </article>
  );
};
