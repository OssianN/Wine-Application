import { Dialog, DialogContent } from '@/components/ui/dialog';
import { WineForm } from '.';
import { WineDialogHeader } from '../Dashboard/WineDialogHeader';

type WineFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column?: string;
  shelf?: string;
};

const WineFormDialog = ({
  open,
  onOpenChange,
  shelf,
  column,
}: WineFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-8 overflow-auto max-h-full">
        <WineDialogHeader
          title="Add wine"
          description={
            <>
              <span>Add a new wine to </span>
              <span className="text-neutral-100 font-bold">
                self: {Number(shelf) + 1} column: {Number(column) + 1}
              </span>
            </>
          }
        />

        <WineForm shelf={shelf} column={column} />
      </DialogContent>
    </Dialog>
  );
};

export default WineFormDialog;
