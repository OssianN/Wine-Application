import { vivinoFetch } from './vivinoFetch';

const COUNTRIES_URL = 'https://www.vivino.com/api/countries';
const SHIP_TO_URL = 'https://www.vivino.com/api/ship_to/';
const SESSION_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10_000;

const JSON_HEADERS = {
  Accept: 'application/json',
  'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
};

export type VivinoSession = {
  cookie: string;
  csrf: string;
};

let cachedSession: { value: VivinoSession; expiresAt: number } | null = null;

export const clearVivinoSessionCache = () => {
  cachedSession = null;
};

export const getSwedishVivinoSession = async (): Promise<VivinoSession> => {
  if (cachedSession && cachedSession.expiresAt > Date.now()) {
    return cachedSession.value;
  }

  const countries = await vivinoFetch(COUNTRIES_URL, {
    headers: JSON_HEADERS,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!countries.ok) {
    throw new Error(`Vivino countries failed: ${countries.status}`);
  }
  await countries.json().catch(() => undefined);

  let cookie = mergeCookies('', getSetCookies(countries));
  const csrf = cookieValue(cookie, 'csrf_token');
  if (!csrf) {
    throw new Error('Vivino CSRF token missing');
  }

  const shipTo = await vivinoFetch(SHIP_TO_URL, {
    method: 'PUT',
    headers: {
      ...JSON_HEADERS,
      'X-CSRF-Token': csrf,
      Origin: 'https://www.vivino.com',
      Referer: 'https://www.vivino.com/sv',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify({
      country_code: 'se',
      state_code: null,
      zip_code: null,
    }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!shipTo.ok) {
    const errorBody = await shipTo.text();
    throw new Error(
      `Vivino ship_to failed: ${shipTo.status} ${errorBody.slice(0, 300)}`
    );
  }

  cookie = mergeCookies(cookie, getSetCookies(shipTo));
  if (!cookieValue(cookie, 'ship_to')) {
    throw new Error('Vivino ship_to cookie missing');
  }

  const session = { cookie, csrf: cookieValue(cookie, 'csrf_token') ?? csrf };
  cachedSession = { value: session, expiresAt: Date.now() + SESSION_TTL_MS };
  return session;
};

export const vivinoJsonHeaders = (session: VivinoSession) => ({
  ...JSON_HEADERS,
  'X-CSRF-Token': session.csrf,
  Origin: 'https://www.vivino.com',
  Referer: 'https://www.vivino.com/sv/explore',
  ...(session.cookie ? { Cookie: session.cookie } : {}),
});

const getSetCookies = (response: Response) => {
  if (typeof response.headers.getSetCookie === 'function') {
    return response.headers.getSetCookie();
  }
  const header = response.headers.get('set-cookie');
  return header ? [header] : [];
};

const cookieValue = (cookie: string, name: string) => {
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  if (!match) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

const mergeCookies = (existing: string, setCookies: string[]) => {
  const jar = new Map<string, string>();
  for (const pair of existing.split(';')) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    jar.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
  }
  for (const header of setCookies) {
    const first = header.split(';', 1)[0];
    const eq = first.indexOf('=');
    if (eq === -1) continue;
    jar.set(first.slice(0, eq).trim(), first.slice(eq + 1));
  }
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join('; ');
};
