'use client';
import { Dialog, DialogContent } from '../ui/dialog';
import { useEffect, useState } from 'react';
import { WineForm } from '../WineForm';
import { WineDetails } from './WineDetails';
import type { Wine } from '@/types';

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
        <DialogContent className="p-8 overflow-y-scroll max-h-full">
          {openWineForm ? (
            <WineForm wine={wine} setOpenWineForm={setOpenWineForm} />
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
