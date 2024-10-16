import { ChevronRight, Dot, Star } from 'lucide-react';
import { BlueBackground } from '../ui/blue-light-background';
import { EditWineMenu } from './EditWineMenu';
import Image from 'next/image';
import useSwr from 'swr';
import { Separator } from '../ui/separator';
import { buttonVariants } from '../ui/button';
import { deleteWine } from '@/mongoDB/deleteWine';
import { WineDialogHeader } from './WineDialogHeader';
import { archiveWine } from '@/mongoDB/archiveWine';
import type { Wine } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import { Skeleton } from '../ui/skeleton';

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
  const fetcher = (url: string) => fetch(url).then(res => res.json());

  const { data: vivinoPrice, isLoading } = useSwr(
    `/api/getVivinoPrice?title=${wine?.title}&year=${wine?.year}&vivinoUrl=${wine?.vivinoUrl}`,
    fetcher
  );

  if (!wine) return null;

  const handleArchive = async () => {
    await archiveWine(wine._id);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    await deleteWine(wine._id);
    onOpenChange(false);
  };

  return (
    <>
      <WineDialogHeader
        title={
          <>
            <span>{wine.title}</span>
            <span>
              <Dot className="inline" />
            </span>
            <span className="text-neutral-500">{wine.country}</span>
          </>
        }
        description={wine.comment}
      >
        <EditWineMenu
          handleArchive={handleArchive}
          handleDelete={handleDelete}
          setOpenWineForm={setOpenWineForm}
          isArchived={!!wine.archived}
          className="absolute top-3 left-4 focus-within:outline-none focus:outline-none"
        />

        <p className="absolute self-center top-2 text-sm text-neutral-500">
          {wine.shelf + 1}:{wine.column + 1}
        </p>

        <div className="relative h-64 w-full">
          <Image
            className="drop-shadow-2xl object-contain p-8 pt-0"
            fill={true}
            sizes="200"
            src={`https:${wine.img}`}
            alt="wine image"
          />
        </div>
        <BlueBackground className="opacity-70" />
      </WineDialogHeader>

      <Separator className="my-4" />

      <div className="flex flex-col items-center">
        <div className="w-full grid grid-cols-3 pb-8 items-center">
          <p className="text-center px-4 border-r-[1px]">{wine.year}</p>
          <div className="text-center px-4 flex flex-col gap-1 h-full">
            <p>{wine.price} kr</p>

            <div className="text-sm h-5 text-neutral-500">
              {isLoading ? (
                <div className="space-y-1 h-full flex flex-col justify-end">
                  <Skeleton className="h-1 w-4/5" />
                  <Skeleton className="h-1 w-full" />
                </div>
              ) : (
                <>
                  <span>Avg. </span>
                  <span className="whitespace-nowrap">
                    {vivinoPrice ? `${vivinoPrice} kr` : 'not available'}
                  </span>
                </>
              )}
            </div>
          </div>
          <p className="text-center px-4 border-l-[1px]">
            <span>{wine.rating}</span>
            <span>
              <Star size={12} className="inline -translate-y-[1px]" />
            </span>
          </p>
        </div>

        {wine.vivinoUrl && (
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
        )}
      </div>
    </>
  );
};
