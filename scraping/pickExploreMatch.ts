import type { ExploreMatch } from './mapExploreMatch';

export const pickExploreMatch = (
  matches: ExploreMatch[] | undefined,
  title: string,
  year: number
) => {
  if (!matches?.length) return undefined;

  const wantedYear = String(year);
  const titleTokens = normalize(title)
    .split(/\s+/)
    .filter((token) => token.length > 1);

  let best = matches[0];
  let bestScore = -1;

  for (const match of matches) {
    const vintage = match.vintage;
    const name = normalize(vintage?.name ?? '');
    const yearScore = String(vintage?.year) === wantedYear ? 20 : 0;
    const tokenScore = titleTokens.filter((token) => name.includes(token)).length;
    const score = yearScore + tokenScore;
    if (score > bestScore) {
      best = match;
      bestScore = score;
    }
  }

  return best;
};

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f’']/g, '')
    .toLowerCase();
