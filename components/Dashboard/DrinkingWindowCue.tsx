import { cn } from '@/lib/utils';
import {
  DRINKING_WINDOW_GRID_LEGEND,
  drinkingWindowGridCue,
  type DrinkingWindowGridCueTone,
} from '@/lib/drinkingWindow';

const CUE_STYLES: Record<
  DrinkingWindowGridCueTone,
  { badge: string; swatch: string }
> = {
  drinkNow: {
    badge:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    swatch: 'bg-emerald-500',
  },
  drinkOrHold: {
    badge:
      'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
    swatch: 'bg-amber-500',
  },
  hold: {
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    swatch: 'bg-sky-500',
  },
  pastPeak: {
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    swatch: 'bg-rose-500',
  },
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
        CUE_STYLES[cue.tone].badge
      )}
    >
      {cue.shortLabel}
    </span>
  );
};

export const DrinkingWindowLegend = () => (
  <ul
    className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-600 dark:text-neutral-400"
    aria-label="Drinking window colors"
  >
    {DRINKING_WINDOW_GRID_LEGEND.map(item => (
      <li key={item.tone} className="flex items-center gap-2">
        <span
          className={cn(
            'size-2.5 shrink-0 rounded-full',
            CUE_STYLES[item.tone].swatch
          )}
          aria-hidden
        />
        {item.label}
      </li>
    ))}
  </ul>
);
