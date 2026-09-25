import { ChevronRight, Dot, Star } from 'lucide-react';
import { BlueBackground } from '../ui/blue-light-background';
import { EditWineMenu } from './EditWineMenu';
import { UnarchiveWineDialog } from './UnarchiveWineDialog';
import Image from 'next/image';
import useSwr from 'swr';
import { Separator } from '../ui/separator';
import { buttonVariants } from '../ui/button';
import { deleteWine } from '@/mongoDB/deleteWine';
import { WineDialogHeader } from './WineDialogHeader';
import { archiveWine } from '@/mongoDB/archiveWine';
import { Skeleton } from '../ui/skeleton';
import { useState, type Dispatch, type SetStateAction } from 'react';
import type { Wine } from '@/types';
import {
  drinkingWindowFromWine,
  drinkingWindowStatusLabel,
  formatDrinkingWindow,
} from '@/lib/drinkingWindow';
import { ensureHttps, vivinoVintageIdFromUrl, vivinoWineIdFromUrl } from '@/lib/utils';

type WineDetailsProps = {
  wine: Wine | null;
  onOpenChange: (open: boolean) => void;
  setOpenWineForm: Dispatch<SetStateAction<boolean>>;
};

const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000 * 60,
} as const;

const detailsQuery = (wine: Wine | null) => {
  if (!wine) return null;
  const wineId = vivinoWineIdFromUrl(wine.vivinoUrl);
  const vintageId = wine.vintageId ?? vivinoVintageIdFromUrl(wine.vivinoUrl);
  if ((wineId == null || !wine.year) && vintageId == null) return null;

  const params = new URLSearchParams({ id: wine._id });
  if (wineId != null) params.set('wineId', String(wineId));
  if (wine.year) params.set('year', String(wine.year));
  if (vintageId != null) params.set('vintageId', String(vintageId));
  return `/api/getVivinoDetails?${params}`;
};

export const WineDetails = ({
  wine,
  onOpenChange,
  setOpenWineForm,
}: WineDetailsProps) => {
  const { data, isValidating } = useSwr(detailsQuery(wine), fetcher, {
    fallbackData: {
      price: wine?.currentPrice,
      drinkingWindowStart: wine?.drinkingWindowStart,
      drinkingWindowEnd: wine?.drinkingWindowEnd,
      drinkingWindowStatus: wine?.drinkingWindowStatus,
    },
    ...swrOptions,
  });

  const vivinoPrice = data?.price ?? wine?.currentPrice ?? null;
  const [unarchiveOpen, setUnarchiveOpen] = useState(false);

  if (!wine) return null;

  const drinkingWindow = drinkingWindowFromWine({
    drinkingWindowStart:
      data?.drinkingWindowStart ?? wine.drinkingWindowStart,
    drinkingWindowEnd: data?.drinkingWindowEnd ?? wine.drinkingWindowEnd,
    drinkingWindowStatus:
      data?.drinkingWindowStatus ?? wine.drinkingWindowStatus,
  });
  const windowYears = formatDrinkingWindow(drinkingWindow);
  const windowStatus = drinkingWindowStatusLabel(drinkingWindow?.status);

  const pricePercent =
    vivinoPrice && wine.price
      ? Math.round(((vivinoPrice - wine.price) / wine.price) * 100)
      : null;

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
          onUnarchive={() => setUnarchiveOpen(true)}
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
            src={ensureHttps(wine.img)}
            alt="wine image"
          />
        </div>

        <BlueBackground className="opacity-70" />
      </WineDialogHeader>

      <Separator className="my-4" />

      <div className="flex flex-col items-center">
        <div className="w-full grid grid-cols-3 grid-rows-[auto_auto_auto] pb-8 text-lg font-electrolize">
          <div className="grid grid-rows-subgrid row-span-3 text-center px-4 border-r-[1px]">
            <p>{wine.year}</p>
            {isValidating && !windowYears && !windowStatus ? (
              <>
                <div className="pt-1 flex justify-center">
                  <Skeleton className="h-1 w-4/5" />
                </div>
                <div className="flex justify-center">
                  <Skeleton className="h-1 w-3/5" />
                </div>
              </>
            ) : (
              <>
                {windowYears ? (
                  <p
                    className={`text-sm text-neutral-500 font-normal pt-1 ${
                      isValidating ? 'animate-pulse' : ''
                    }`}
                  >
                    {windowYears}
                  </p>
                ) : windowStatus ? (
                  <span />
                ) : null}
                {windowStatus && (
                  <p
                    className={`text-xs text-neutral-500 font-normal ${
                      isValidating ? 'animate-pulse' : ''
                    }`}
                  >
                    {windowStatus}
                  </p>
                )}
              </>
            )}
          </div>
          <div className="grid grid-rows-subgrid row-span-3 text-center px-4">
            <p>{wine.price != null ? `${wine.price} kr` : '—'}</p>
            <div className="text-sm text-neutral-500 pt-1">
              {isValidating && !vivinoPrice ? (
                <div className="space-y-1 flex flex-col items-center">
                  <Skeleton className="h-1 w-4/5" />
                  <Skeleton className="h-1 w-full" />
                </div>
              ) : (
                <>
                  <span>Today </span>
                  <span
                    className={`whitespace-nowrap ${
                      isValidating ? 'animate-pulse' : ''
                    }`}
                  >
                    {vivinoPrice ? `${vivinoPrice} kr` : 'N/A'}
                  </span>
                </>
              )}
            </div>
            {pricePercent != null && (
              <p className="text-xs text-neutral-500">{pricePercent}%</p>
            )}
          </div>
          <div className="grid grid-rows-subgrid row-span-3 text-center px-4 border-l-[1px]">
            <p>
              <span>{wine.rating}</span>
              <span>
                <Star size={12} className="inline -translate-y-[1px]" />
              </span>
            </p>
          </div>
        </div>

        {wine.vivinoUrl && (
          <a
            className={`${buttonVariants({
              size: 'lg',
              variant: 'outline',
            })} w-48 flex-shrink`}
            href={wine.vivinoUrl}
            target="_blank"
          >
            <span>Vivino</span>
            <span>
              <ChevronRight size={16} />
            </span>
          </a>
        )}
      </div>

      <UnarchiveWineDialog
        wine={wine}
        open={unarchiveOpen}
        onOpenChange={setUnarchiveOpen}
        onRestored={() => onOpenChange(false)}
      />
    </>
  );
};

const fetcher = (url: string) =>
  fetch(url, { credentials: 'same-origin' }).then(res => res.json());
