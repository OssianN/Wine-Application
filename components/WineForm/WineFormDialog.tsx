import { Dialog, DialogContent } from '@/components/ui/dialog';
import { WineForm } from '.';
import { WineDialogHeader } from '../Dashboard/WineDialogHeader';
import { useEffect, useState } from 'react';

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
  const [isResize, setIsResize] = useState(0);

  useEffect(() => {
    const handleResize = () =>
      setIsResize(window?.visualViewport?.height ?? window.innerHeight);

    window.visualViewport?.addEventListener('resize', handleResize);
    handleResize();

    return () =>
      window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-8 overflow-auto top-0"
        style={{
          maxHeight: `calc(${isResize}px - 4rem)`,
        }}
      >
        <WineDialogHeader
          title="Add wine"
          description={
            <>
              <span>Add a new wine to </span>
              <span className="text-neutral-100 font-bold">
                {Number(shelf) + 1}:{Number(column) + 1}
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
