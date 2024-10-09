import Image from 'next/image';
import { useContext } from 'react';
import { WineContext } from '@/providers/WineProvider';
import { SearchContext } from '@/providers/SearchProvider';
import { BlueBackground } from '../ui/blue-light-background';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { GripHorizontal } from 'lucide-react';
import type { Wine } from '@/types';

type WineCardProps = {
  wine: Wine;
};

export const WineCard = ({ wine }: WineCardProps) => {
  const { handleOpenWineDialog } = useContext(WineContext);
  const { searchTerm } = useContext(SearchContext);

  const {
    attributes,
    listeners,
    setNodeRef: setNodeRefDrag,
    transform,
    isDragging,
  } = useDraggable({
    id: wine._id,
    data: {
      supports: ['empty-slot'],
      type: 'wine',
      ...wine,
    },
  });

  const { setNodeRef } = useDroppable({
    id: wine._id,
    data: { type: 'wine', wine },
  });

  const dragStyle = {
    transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
    zIndex: isDragging ? 200 : undefined,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <article
      id={wine._id}
      ref={setNodeRefDrag}
      className="bg-neutral-50 dark:bg-neutral-950 rounded-md shadow-sm group"
      onClick={() => handleOpenWineDialog(wine)}
      style={{
        gridRow: !searchTerm ? Number(wine.shelf) + 1 : undefined,
        gridColumn: !searchTerm ? Number(wine.column) + 1 : undefined,
        ...dragStyle,
      }}
    >
      <div
        ref={setNodeRef}
        className="flex flex-col items-center text-center gap-2 min-w-32 p-4 relative overflow-hidden cursor-pointer"
      >
        <p className="absolute top-4 left-4 text-neutral-500 text-sm">
          <span>{wine.shelf + 1}</span>:<span>{wine.column + 1}</span>
        </p>

        <GripHorizontal
          size={16}
          className="absolute top-4 right-4 text-neutral-500 text-sm z-50"
          {...listeners}
          {...attributes}
          style={{ touchAction: 'manipulation' }}
        />

        <BlueBackground />

        <Image
          key={wine._id}
          width={200}
          height={200}
          src={`https:${wine.img}`}
          alt={wine.title}
          style={{ touchAction: 'none' }}
          className="drop-shadow-2xl betterhover:group-hover:drop-shadow-none betterhover:group-hover:scale-110 transition-all duration-500"
        />

        <h3 className="text-sm font-bold line-clamp-2 w-full pt-2">
          {wine.title}
        </h3>
        <p className="text-sm truncate w-full text-neutral-500">
          {wine.country}
        </p>
        <p className="text-sm w-full dark:text-neutral-300">
          <span>{wine.price} </span>
          <span>kr</span>
        </p>
      </div>
    </article>
  );
};
