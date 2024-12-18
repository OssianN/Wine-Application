import Image from 'next/image';
import { useContext } from 'react';
import { WineContext } from '@/providers/WineProvider';
import { SearchContext } from '@/providers/SearchProvider';
import { BlueBackground } from '../ui/blue-light-background';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { GripIcon } from 'lucide-react';
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
      className="bg-neutral-50 dark:bg-neutral-950 rounded-md shadow-sm"
      onClick={() => handleOpenWineDialog(wine)}
      style={{
        gridRow: !searchTerm ? Number(wine.shelf) + 1 : undefined,
        gridColumn: !searchTerm ? Number(wine.column) + 1 : undefined,
        ...dragStyle,
      }}
    >
      <div
        ref={setNodeRef}
        className="flex flex-col items-center rounded-md text-center gap-2 min-w-32 p-4 relative overflow-hidden cursor-pointer betterhover:hover:scale-[1.03] transition-all duration-300"
      >
        <p className="absolute top-4 left-4 text-neutral-500 text-sm">
          <span>{wine.shelf + 1}</span>:<span>{wine.column + 1}</span>
        </p>

        <p
          className="absolute p-4 top-0 right-0 text-neutral-500 z-50"
          style={{ touchAction: 'manipulation' }}
          {...listeners}
          {...attributes}
        >
          <GripIcon size={16} />
        </p>

        <BlueBackground />

        <Image
          key={wine._id}
          width={200}
          height={200}
          src={`https:${wine.img}`}
          alt={wine.title}
          style={{ touchAction: 'none' }}
          className="pt-5 drop-shadow-2xl"
        />

        <h3 className="text-sm font-bold line-clamp-2 w-full pt-2">
          {wine.title}
        </h3>
        <p className="text-sm truncate w-full text-neutral-500">
          {wine.country}
        </p>
        <div className="font-electrolize flex justify-center text-sm w-full dark:text-neutral-300">
          <p>{wine.price}</p>
          {wine.currentPrice && (
            <>
              <span>/</span>
              <p className="text-neutral-500">{wine.currentPrice} kr</p>
            </>
          )}
        </div>
      </div>
    </article>
  );
};
