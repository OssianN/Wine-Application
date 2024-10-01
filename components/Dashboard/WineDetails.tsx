import { ChevronRight, Dot, Star } from 'lucide-react';
import { BlueBackground } from '../ui/blue-light-background';
import { DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { EditWineMenu } from './EditWineMenu';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import { buttonVariants } from '../ui/button';
import { deleteWine } from '@/mongoDB/deleteWine';
import type { Wine } from '@/types';
import type { Dispatch, SetStateAction } from 'react';

type WineDetailsProps = {
  wine: Wine | null;
  onOpenChange: (open: boolean) => void;
  setOpenWineForm: Dispatch<SetStateAction<boolean>>;
};

export const WineDetails = ({
  wine,
  onOpenChange,
  setOpenWineForm,
}: WineDetailsProps) => {
  if (!wine) return null;

  const handleArchive = async () => {
    await deleteWine(wine._id);
    onOpenChange(false);
  };

  return (
    <>
      <DialogHeader className="flex flex-col items-center">
        <EditWineMenu
          handleArchive={handleArchive}
          setOpenWineForm={setOpenWineForm}
          className="absolute top-3 left-4"
        />

        <div className="relative h-64 w-full">
          <Image
            className="drop-shadow-2xl object-contain p-8 pt-0"
            fill={true}
            sizes="200"
            src={`https:${wine.img}`}
            alt={''}
          />
        </div>
        <BlueBackground className="opacity-70" />

        <DialogTitle className="pb-2">
          <span>{wine.title}</span>
          <span>
            <Dot className="inline" />
          </span>
          <span className="text-neutral-400">{wine.country}</span>
        </DialogTitle>
        <DialogDescription>{wine.comment}</DialogDescription>
      </DialogHeader>

      <Separator className="my-4" />

      <div className="flex flex-col justify-center items-center ">
        <div className="grid grid-cols-3 pb-8">
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
            variant: 'outline',
          })} w-48 flex-shrink`}
          href={wine.vivinoUrl}
        >
          <span>Vivino</span>
          <span>
            <ChevronRight size={16} />
          </span>
        </a>
      </div>
    </>
  );
};
