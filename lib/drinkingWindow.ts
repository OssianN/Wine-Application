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
