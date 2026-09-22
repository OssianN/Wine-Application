import {
  getJwtSecret,
  isHttpsPublicUrl,
  resourceMatches,
  resolveResourceUrl,
  trimTrailingSlash,
} from './urls';

describe('oauth urls', () => {
  const original = process.env.MCP_RESOURCE_URL;

  afterEach(() => {
    if (original == null) {
      delete process.env.MCP_RESOURCE_URL;
    } else {
      process.env.MCP_RESOURCE_URL = original;
    }
  });

  it('uses the configured resource URL', () => {
    process.env.MCP_RESOURCE_URL = 'https://wine.example/';
    expect(resolveResourceUrl()).toBe('https://wine.example');
  });

  it('falls back to forwarded request headers', () => {
    delete process.env.MCP_RESOURCE_URL;
    const req = new Request('http://127.0.0.1/api/mcp', {
      headers: {
        'x-forwarded-host': 'wine.example',
        'x-forwarded-proto': 'https',
      },
    });
    expect(resolveResourceUrl(req)).toBe('https://wine.example');
  });

  it('accepts the origin or the /api/mcp resource identifier', () => {
    expect(resourceMatches(null, 'https://wine.example')).toBe(true);
    expect(resourceMatches('https://wine.example', 'https://wine.example')).toBe(
      true
    );
    expect(
      resourceMatches('https://wine.example/api/mcp', 'https://wine.example')
    ).toBe(true);
    expect(resourceMatches('https://other.example', 'https://wine.example')).toBe(
      false
    );
  });

  it('allows only public https URLs for client metadata', () => {
    expect(isHttpsPublicUrl('https://chatgpt.com/oauth/client.json')).toBe(true);
    expect(isHttpsPublicUrl('http://chatgpt.com/oauth/client.json')).toBe(false);
    expect(isHttpsPublicUrl('https://localhost/client.json')).toBe(false);
    expect(isHttpsPublicUrl('https://10.0.0.2/client.json')).toBe(false);
    expect(trimTrailingSlash('https://wine.example/')).toBe(
      'https://wine.example'
    );
  });
});

describe('getJwtSecret', () => {
  const originalJwt = process.env.MCP_JWT_SECRET;
  const originalCookie = process.env.SECRET_COOKIE_PASSWORD;

  afterEach(() => {
    if (originalJwt == null) {
      delete process.env.MCP_JWT_SECRET;
    } else {
      process.env.MCP_JWT_SECRET = originalJwt;
    }
    if (originalCookie == null) {
      delete process.env.SECRET_COOKIE_PASSWORD;
    } else {
      process.env.SECRET_COOKIE_PASSWORD = originalCookie;
    }
  });

  it('prefers MCP_JWT_SECRET when it is set', () => {
    process.env.MCP_JWT_SECRET = 'dedicated-jwt-secret';
    process.env.SECRET_COOKIE_PASSWORD = 'iron-session-cookie-password';
    expect(getJwtSecret()).toBe('dedicated-jwt-secret');
  });

  it('uses SECRET_COOKIE_PASSWORD when MCP_JWT_SECRET is empty', () => {
    delete process.env.MCP_JWT_SECRET;
    process.env.SECRET_COOKIE_PASSWORD = 'iron-session-cookie-password';
    expect(getJwtSecret()).toBe('iron-session-cookie-password');
  });

  it('rejects secrets shorter than 16 characters', () => {
    process.env.MCP_JWT_SECRET = 'too-short';
    delete process.env.SECRET_COOKIE_PASSWORD;
    expect(() => getJwtSecret()).toThrow(/at least 16 characters/);
  });
});
