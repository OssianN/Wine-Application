import type { DrinkingWindow } from '@/types';

const STATUS_LABELS: Record<number, string> = {
  0: 'Drink at your pace',
  1: 'Drink at your pace',
  2: 'Drink at your pace',
  3: 'Hold',
  4: 'Drink or hold',
  5: 'Drink now',
  6: 'Past its peak',
};

export type DrinkingWindowGridCueTone =
  | 'drinkNow'
  | 'drinkOrHold'
  | 'hold'
  | 'pastPeak';

type DrinkingWindowGridCue = {
  tone: DrinkingWindowGridCueTone;
  label: string;
  shortLabel: string;
};

const GRID_CUES: Record<
  number,
  { tone: DrinkingWindowGridCueTone; shortLabel: string }
> = {
  3: { tone: 'hold', shortLabel: 'Hold' },
  4: { tone: 'drinkOrHold', shortLabel: 'Drink or hold' },
  5: { tone: 'drinkNow', shortLabel: 'Drink now' },
  6: { tone: 'pastPeak', shortLabel: 'Past peak' },
};

type DrinkingWindowFields = {
  drinkingWindowStart?: number | null;
  drinkingWindowEnd?: number | null;
  drinkingWindowStatus?: number | null;
};

export const drinkingWindowFromWine = (
  wine: DrinkingWindowFields
): DrinkingWindow | null => {
  if (
    wine.drinkingWindowStart == null &&
    wine.drinkingWindowEnd == null &&
    wine.drinkingWindowStatus == null
  ) {
    return null;
  }

  return {
    startYear: wine.drinkingWindowStart,
    endYear: wine.drinkingWindowEnd,
    status: wine.drinkingWindowStatus,
  };
};

export const formatDrinkingWindow = (window?: DrinkingWindow | null) => {
  if (!window) return null;
  const start = window.startYear;
  const end = window.endYear;
  if (start == null && end == null) return null;
  if (start != null && end != null) return `${start} – ${end}`;
  return String(start ?? end);
};

export const drinkingWindowStatusLabel = (status?: number | null) => {
  if (status == null) return null;
  return STATUS_LABELS[status] ?? null;
};

export const drinkingWindowGridCue = (
  status?: number | null
): DrinkingWindowGridCue | null => {
  if (status == null) return null;
  const cue = GRID_CUES[status];
  if (!cue) return null;
  return {
    tone: cue.tone,
    shortLabel: cue.shortLabel,
    label: STATUS_LABELS[status],
  };
};
