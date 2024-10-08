import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { WineContext } from '@/providers/WineProvider';
import { useContext } from 'react';
import { useDroppable } from '@dnd-kit/core';

type AddWineCardProps = {
  id: string;
};

export const AddWineCard = ({ id }: AddWineCardProps) => {
  const [shelf, column] = id.split(':');
  const shelfNumber = Number(shelf) + 1;
  const columnNumber = Number(column) + 1;

  const { handleOpenWineFormDialog } = useContext(WineContext);

  const handleOpenForm = () => {
    handleOpenWineFormDialog({ shelf, column });
  };

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'empty-slot', shelf, column },
  });

  return (
    <Button
      ref={setNodeRef}
      key={id}
      className="h-full min-h-48 rounded-md min-w-32 shadow-sm relative bg-neutral-50  text-neutral-300 dark:text-neutral-500 transition-all duration-300 -outline-offset-4 hover:text-neutral-400 dark:bg-neutral-950 dark:hover:bg-neutral-900 dark:border border-neutral-950"
      style={{
        gridRow: shelfNumber,
        gridColumn: columnNumber,
        outline: isOver
          ? '4px solid rgb(115 115 115 / var(--tw-bg-opacity))'
          : 'none',
      }}
      variant="ghost"
      onClick={handleOpenForm}
    >
      <p className="absolute top-4 left-4 text-sm">
        <span>{shelfNumber}</span>:<span>{columnNumber}</span>
      </p>

      <PlusCircle />
    </Button>
  );
};
