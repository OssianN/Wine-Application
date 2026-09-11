import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ensureHttps(url: string | undefined | null) {
  if (!url) return '/wineNotFound.png';
  if (url.startsWith('https')) return url;
  return `https:${url}`;
}

export const vivinoWineIdFromUrl = (url?: string | null) => {
  if (!url) return null;
  const match = url.match(/\/w\/(\d+)/);
  const wineId = match ? Number(match[1]) : NaN;
  return Number.isFinite(wineId) ? wineId : null;
};

export const vivinoVintageIdFromUrl = (url?: string | null) => {
  if (!url) return null;
  const match = url.match(/\/wines\/(\d+)/);
  const vintageId = match ? Number(match[1]) : NaN;
  return Number.isFinite(vintageId) ? vintageId : null;
};
