import type { Wine } from '@/types';

const TITLE_EXACT = 50;
const TITLE_PREFIX = 25;
const TITLE_WORD_START = 30;
const TITLE_CONTAINS = 20;
const COUNTRY_MATCH = 10;
const YEAR_MATCH = 10;
const COMMENT_MATCH = 4;

const COUNTRY_GROUPS = [
  ['italy', 'italien', 'italia'],
  ['spain', 'spanien', 'espana'],
  ['france', 'frankrike', 'frankreich'],
  ['germany', 'tyskland', 'deutschland'],
  ['argentina', 'argentinien'],
  ['australia', 'australien'],
  ['austria', 'osterrike', 'osterreich'],
  ['usa', 'united states', 'amerika'],
  ['south africa', 'sydafrika'],
  ['portugal'],
  ['chile'],
];

const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const COUNTRY_ALIAS_GROUPS = COUNTRY_GROUPS.map(group =>
  group.map(alias => normalizeSearchText(alias))
);

export const searchWines = (wines: Wine[], searchTerm: string): Wine[] => {
  const tokens = tokenize(searchTerm);
  const normalizedQuery = normalizeSearchText(searchTerm);

  if (!tokens.length) {
    return [...wines].sort(comparePosition);
  }

  const scored: { wine: Wine; score: number }[] = [];

  for (const wine of wines) {
    const score = scoreWine(wine, tokens, normalizedQuery);
    if (score == null) continue;
    scored.push({ wine, score });
  }

  scored.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return comparePosition(a.wine, b.wine);
  });

  return scored.map(entry => entry.wine);
};

const tokenize = (query: string) =>
  normalizeSearchText(query).split(' ').filter(Boolean);

const scoreWine = (
  wine: Wine,
  tokens: string[],
  normalizedQuery: string
) => {
  const title = normalizeSearchText(wine.title ?? '');
  const country = normalizeSearchText(wine.country ?? '');
  const comment = normalizeSearchText(wine.comment ?? '');
  const year = wine.year == null ? '' : String(wine.year);

  let score = 0;

  for (const token of tokens) {
    const tokenScore = scoreToken(token, title, country, comment, year);
    if (tokenScore == null) return null;
    score += tokenScore;
  }

  if (title && title === normalizedQuery) score += TITLE_EXACT;
  else if (title.startsWith(normalizedQuery)) score += TITLE_PREFIX;

  return score;
};

const scoreToken = (
  token: string,
  title: string,
  country: string,
  comment: string,
  year: string
) => {
  const titleScore = fieldContainsScore(
    title,
    token,
    TITLE_WORD_START,
    TITLE_CONTAINS
  );
  if (titleScore) return titleScore;
  if (countryMatches(country, token)) return COUNTRY_MATCH;
  if (yearMatches(year, token)) return YEAR_MATCH;
  if (comment.includes(token)) return COMMENT_MATCH;
  return null;
};

const fieldContainsScore = (
  field: string,
  token: string,
  wordStartScore: number,
  containsScore: number
) => {
  if (!field) return 0;
  if (hasWordStart(field, token)) return wordStartScore;
  if (field.includes(token)) return containsScore;
  return 0;
};

const hasWordStart = (field: string, token: string) =>
  field.startsWith(token) ||
  words(field).some(word => word.startsWith(token));

const words = (field: string) => field.split(/[^a-z0-9]+/).filter(Boolean);

const countryMatches = (country: string, token: string) => {
  if (!country) return false;
  if (country.includes(token)) return true;

  return COUNTRY_ALIAS_GROUPS.some(group => {
    if (!tokenHitsCountryGroup(token, group)) return false;
    return group.some(alias => country.includes(alias));
  });
};

const tokenHitsCountryGroup = (token: string, group: string[]) =>
  group.some(
    alias =>
      alias === token ||
      alias.startsWith(token) ||
      alias.split(' ').some(word => word === token || word.startsWith(token))
  );

const yearMatches = (year: string, token: string) => {
  if (!year || !/^\d{2,4}$/.test(token)) return false;
  return year === token || year.endsWith(token);
};

const comparePosition = (a: Wine, b: Wine) => {
  if (a.shelf !== b.shelf) return a.shelf - b.shelf;
  return a.column - b.column;
};
