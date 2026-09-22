const AUTHORIZE_PATH = '/oauth/authorize';
const MAX_LENGTH = 2048;

export const isSafeOauthReturnTo = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_LENGTH) {
    return false;
  }

  if (value.includes('\\') || value.includes('#') || value.startsWith('//')) {
    return false;
  }

  const queryIndex = value.indexOf('?');
  const path = queryIndex === -1 ? value : value.slice(0, queryIndex);
  return path === AUTHORIZE_PATH;
};

export const loginUrlForAuthorize = (returnTo: string) =>
  `/login?returnTo=${encodeURIComponent(returnTo)}`;
