export const trimTrailingSlash = (value: string) => value.replace(/\/$/, '');

export const getConfiguredResourceUrl = () => {
  const configured = process.env.MCP_RESOURCE_URL;
  if (!configured) {
    return null;
  }
  return trimTrailingSlash(configured);
};

const resourceUrlFromHost = (host: string | null, proto?: string | null) => {
  if (!host) {
    throw new Error('MCP_RESOURCE_URL is not set');
  }
  const scheme =
    proto ?? (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
  return `${scheme}://${host}`;
};

export const resolveResourceUrl = (req?: Request) => {
  const configured = getConfiguredResourceUrl();
  if (configured) {
    return configured;
  }

  if (!req) {
    throw new Error('MCP_RESOURCE_URL is not set');
  }

  return resourceUrlFromHost(
    req.headers.get('x-forwarded-host') ?? new URL(req.url).host,
    req.headers.get('x-forwarded-proto')
  );
};

export const resolveResourceUrlFromHeaders = (headerStore: {
  get: (name: string) => string | null;
}) => {
  const configured = getConfiguredResourceUrl();
  if (configured) {
    return configured;
  }

  return resourceUrlFromHost(
    headerStore.get('x-forwarded-host') ?? headerStore.get('host'),
    headerStore.get('x-forwarded-proto')
  );
};

export const getJwtSecret = () => {
  const secret =
    process.env.MCP_JWT_SECRET || process.env.SECRET_COOKIE_PASSWORD || '';
  if (secret.length < 16) {
    throw new Error(
      'MCP_JWT_SECRET or SECRET_COOKIE_PASSWORD must be at least 16 characters'
    );
  }
  return secret;
};

export const resourceMatches = (resource: string | null, resourceUrl: string) => {
  if (!resource) {
    return true;
  }
  const normalized = trimTrailingSlash(resource);
  return (
    normalized === resourceUrl ||
    normalized === `${resourceUrl}/api/mcp`
  );
};

const isHttpsUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isHttpsPublicUrl = (value: string) => {
  if (!isHttpsUrl(value)) {
    return false;
  }

  const { hostname } = new URL(value);
  const host = hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost')) {
    return false;
  }
  if (host === '127.0.0.1' || host === '::1' || host === '[::1]') {
    return false;
  }
  if (/^10\./.test(host)) {
    return false;
  }
  if (/^192\.168\./.test(host)) {
    return false;
  }
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) {
    return false;
  }
  if (/^169\.254\./.test(host)) {
    return false;
  }
  return true;
};
