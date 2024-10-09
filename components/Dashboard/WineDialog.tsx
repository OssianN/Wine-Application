'use client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { WineForm } from '@/components/WineForm';
import { WineDetails } from './WineDetails';
import type { Wine } from '@/types';
import { WineDialogHeader } from './WineDialogHeader';

type WineDialogProps = {
  wine: Wine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const WineDialog = ({ wine, open, onOpenChange }: WineDialogProps) => {
  const [openWineForm, setOpenWineForm] = useState(false);

  useEffect(() => {
    if (!open) {
      setTimeout(() => setOpenWineForm(false), 400);
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="px-8 py-16 overflow-auto">
          {openWineForm ? (
            <>
              <WineDialogHeader
                title="Edit Wine"
                description={
                  <>
                    <span>Edit wine at </span>
                    <span className="text-neutral-100">
                      {Number(wine?.shelf) + 1}:{Number(wine?.column) + 1}
                    </span>
                  </>
                }
              />
              <WineForm wine={wine} setOpenWineForm={setOpenWineForm} />
            </>
          ) : (
            <WineDetails
              wine={wine}
              onOpenChange={onOpenChange}
              setOpenWineForm={setOpenWineForm}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
