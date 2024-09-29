import Image from 'next/image';
import { buttonVariants } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from './ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Wine } from '@/types';
import { Star } from 'lucide-react';

type WineDialogProps = {
  wine: Wine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const WineDialog = ({ wine, open, onOpenChange }: WineDialogProps) => {
  if (!wine) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex flex-col items-center">
          <div className="relative h-64 w-full">
            <Image
              className="object-contain p-8"
              fill={true}
              src={`https:${wine.img}`}
              alt={''}
            />
          </div>

          <DialogTitle>{wine.title}</DialogTitle>
          <DialogDescription>{wine.comment}</DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="flex flex-col justify-center items-center ">
          <div className="grid grid-cols-3 divide-x-2 divide-white pb-8">
            <p className="text-center px-4">{wine.year}</p>
            <p className="text-center px-4">
              <span>{wine.price}</span>
              <span>kr</span>
            </p>
            <p className="text-center px-4">
              <span>{wine.rating}</span>
              <span>
                <Star size={12} className="inline -translate-y-[1px]" />
              </span>
            </p>
          </div>
          <a
            className={`${buttonVariants({
              size: 'lg',
            })} w-48 flex-shrink`}
            href={wine.vivinoUrl}
          >
            <span>Vivino </span>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
