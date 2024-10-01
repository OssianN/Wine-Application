import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';

type AddWineCardProps = {
  id: string;
};

export const AddWineCard = ({ id }: AddWineCardProps) => {
  const [shelf, column] = id.split(':');
  const shelfNumber = Number(shelf) + 1;
  const columnNumber = Number(column) + 1;
  return (
    <Button
      key={id}
      id={id}
      className="h-full min-h-48 rounded-md min-w-32 shadow-sm bg-gray-50 relative text-neutral-300 dark:text-neutral-500 hover:text-neutral-400 dark:bg-[#0b0b0b] dark:hover:bg-neutral-900 dark:border border-neutral-950"
      style={{
        gridRow: shelfNumber,
        gridColumn: columnNumber,
      }}
      variant="ghost"
    >
      <p className="absolute top-4 left-4 text-sm">
        <span>{shelfNumber}</span>:<span>{columnNumber}</span>
      </p>

      <PlusCircle />
    </Button>
  );
};
