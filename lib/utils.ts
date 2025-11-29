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
