import { cn } from '@/lib/utils';
import {
  drinkingWindowGridCue,
  type DrinkingWindowGridCueTone,
} from '@/lib/drinkingWindow';

const CUE_STYLES: Record<DrinkingWindowGridCueTone, string> = {
  drinkNow:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  drinkOrHold:
    'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
  hold: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  pastPeak: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
};

export const DrinkingWindowBadge = ({
  status,
}: {
  status?: number | null;
}) => {
  const cue = drinkingWindowGridCue(status);
  if (!cue) return null;

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-none tracking-wide',
        CUE_STYLES[cue.tone]
      )}
    >
      {cue.shortLabel}
    </span>
  );
};
