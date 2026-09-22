/**
 * @jest-environment node
 */

import {
  consumeAuthorizationCode,
  createRefreshToken,
  findRefreshToken,
} from '@/mongoDB/oauthStore';
import { sha256Base64Url } from './crypto';
import { exchangeAuthorizationCode, exchangeRefreshToken } from './grants';
import { verifyAccessToken } from './jwt';

jest.mock('@/mongoDB/oauthStore', () => ({
  consumeAuthorizationCode: jest.fn(),
  createRefreshToken: jest.fn(),
  findRefreshToken: jest.fn(),
}));

const mockConsume = consumeAuthorizationCode as jest.MockedFunction<
  typeof consumeAuthorizationCode
>;
const mockCreateRefresh = createRefreshToken as jest.MockedFunction<
  typeof createRefreshToken
>;
const mockFindRefresh = findRefreshToken as jest.MockedFunction<
  typeof findRefreshToken
>;

describe('OAuth grants', () => {
  const resourceUrl = 'https://wine.example';
  const verifier = 'a'.repeat(43);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MCP_JWT_SECRET = 'test-jwt-secret-key';
    mockCreateRefresh.mockResolvedValue('refresh-1');
  });

  it('exchanges a PKCE authorization code for user-bound tokens', async () => {
    mockConsume.mockResolvedValue({
      userId: 'user-1',
      clientId: 'client-1',
      redirectUri: 'https://chatgpt.com/connector/oauth/x',
      codeChallenge: sha256Base64Url(verifier),
      resource: resourceUrl,
      scope: 'cellar:read',
    });

    const result = await exchangeAuthorizationCode({
      code: 'code-1',
      redirectUri: 'https://chatgpt.com/connector/oauth/x',
      clientId: 'client-1',
      codeVerifier: verifier,
      resourceUrl,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.body.refresh_token).toBe('refresh-1');
    await expect(
      verifyAccessToken(result.body.access_token, resourceUrl)
    ).resolves.toMatchObject({ userId: 'user-1', clientId: 'client-1' });
  });

  it('rejects a wrong PKCE verifier', async () => {
    mockConsume.mockResolvedValue({
      userId: 'user-1',
      clientId: 'client-1',
      redirectUri: 'https://chatgpt.com/connector/oauth/x',
      codeChallenge: sha256Base64Url(verifier),
      resource: resourceUrl,
      scope: 'cellar:read',
    });

    const result = await exchangeAuthorizationCode({
      code: 'code-1',
      redirectUri: 'https://chatgpt.com/connector/oauth/x',
      clientId: 'client-1',
      codeVerifier: 'b'.repeat(43),
      resourceUrl,
    });

    expect(result).toMatchObject({
      ok: false,
      body: { error: 'invalid_grant' },
    });
  });

  it('issues a new access token from a stored refresh token', async () => {
    mockFindRefresh.mockResolvedValue({
      userId: 'user-1',
      clientId: 'client-1',
      scope: 'cellar:read',
    });

    const result = await exchangeRefreshToken({
      refreshToken: 'refresh-1',
      clientId: 'client-1',
      resourceUrl,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.body.refresh_token).toBeUndefined();
    await expect(
      verifyAccessToken(result.body.access_token, resourceUrl)
    ).resolves.toMatchObject({ userId: 'user-1' });
  });
});
