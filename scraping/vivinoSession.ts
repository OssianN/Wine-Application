const HOME_URL = 'https://www.vivino.com/sv';
const SHIP_TO_URL = 'https://www.vivino.com/api/ship_to/';
const SESSION_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10_000;

const HTML_HEADERS = {
  Accept: 'text/html',
  'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
};

const JSON_HEADERS = {
  Accept: 'application/json',
  'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent': HTML_HEADERS['User-Agent'],
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

  const home = await fetch(HOME_URL, {
    headers: HTML_HEADERS,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!home.ok) {
    throw new Error(`Vivino homepage failed: ${home.status}`);
  }

  const html = await home.text();
  const csrf = html.match(/name="csrf-token"\s+content="([^"]+)"/)?.[1];
  if (!csrf) {
    throw new Error('Vivino CSRF token missing');
  }

  let cookie = mergeCookies('', getSetCookies(home));
  const shipTo = await fetch(SHIP_TO_URL, {
    method: 'PUT',
    headers: {
      ...JSON_HEADERS,
      'X-CSRF-Token': csrf,
      Origin: 'https://www.vivino.com',
      Referer: HOME_URL,
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
  const session = { cookie, csrf };
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
