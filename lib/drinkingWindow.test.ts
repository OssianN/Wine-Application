import {
  drinkingWindowFromWine,
  drinkingWindowGridCue,
  drinkingWindowStatusLabel,
  formatDrinkingWindow,
} from './drinkingWindow';
import type { Wine } from '@/types';

describe('formatDrinkingWindow', () => {
  it('formats a start and end year', () => {
    expect(
      formatDrinkingWindow({ startYear: 2021, endYear: 2036, status: 4 })
    ).toBe('2021 – 2036');
  });

  it('formats a single bound', () => {
    expect(formatDrinkingWindow({ startYear: 2021 })).toBe('2021');
    expect(formatDrinkingWindow({ endYear: 2036 })).toBe('2036');
  });

  it('returns null when there are no years', () => {
    expect(formatDrinkingWindow(undefined)).toBeNull();
    expect(formatDrinkingWindow({ status: 5 })).toBeNull();
  });
});

describe('drinkingWindowStatusLabel', () => {
  it('maps Vivino status codes', () => {
    expect(drinkingWindowStatusLabel(3)).toBe('Hold');
    expect(drinkingWindowStatusLabel(4)).toBe('Drink or hold');
    expect(drinkingWindowStatusLabel(5)).toBe('Drink now');
    expect(drinkingWindowStatusLabel(6)).toBe('Past its peak');
    expect(drinkingWindowStatusLabel(0)).toBe('Drink at your pace');
  });

  it('returns null for an unknown status', () => {
    expect(drinkingWindowStatusLabel(undefined)).toBeNull();
    expect(drinkingWindowStatusLabel(99)).toBeNull();
  });
});

describe('drinkingWindowGridCue', () => {
  it('highlights bottles that need a drink decision', () => {
    expect(drinkingWindowGridCue(5)).toEqual({
      tone: 'drinkNow',
      label: 'Drink now',
      shortLabel: 'Drink now',
    });
    expect(drinkingWindowGridCue(4)).toEqual({
      tone: 'drinkOrHold',
      label: 'Drink or hold',
      shortLabel: 'Drink or hold',
    });
    expect(drinkingWindowGridCue(3)).toEqual({
      tone: 'hold',
      label: 'Hold',
      shortLabel: 'Hold',
    });
    expect(drinkingWindowGridCue(6)).toEqual({
      tone: 'pastPeak',
      label: 'Past its peak',
      shortLabel: 'Past peak',
    });
  });

  it('skips quiet or unknown statuses so the shelf stays scannable', () => {
    expect(drinkingWindowGridCue(0)).toBeNull();
    expect(drinkingWindowGridCue(1)).toBeNull();
    expect(drinkingWindowGridCue(2)).toBeNull();
    expect(drinkingWindowGridCue(undefined)).toBeNull();
    expect(drinkingWindowGridCue(99)).toBeNull();
  });
});

describe('drinkingWindowFromWine', () => {
  it('reads flat wine fields', () => {
    expect(
      drinkingWindowFromWine({
        drinkingWindowStart: 2021,
        drinkingWindowEnd: 2036,
        drinkingWindowStatus: 4,
      } as Wine)
    ).toEqual({
      startYear: 2021,
      endYear: 2036,
      status: 4,
    });
  });
});
