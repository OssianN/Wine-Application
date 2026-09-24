/**
 * @jest-environment node
 */

import { CELLAR_READ_SCOPE } from '@/lib/oauth/constants';
import { signAccessToken } from '@/lib/oauth/jwt';
import { userIdFromAuth, verifyMcpBearer } from './verifyAccess';

describe('verifyMcpBearer', () => {
  const resourceUrl = 'https://wine.example';

  beforeEach(() => {
    process.env.MCP_JWT_SECRET = 'test-jwt-secret-key';
    process.env.MCP_RESOURCE_URL = resourceUrl;
  });

  it('accepts a JWT minted for this resource', async () => {
    const token = await signAccessToken(
      { userId: 'user-1', clientId: 'chatgpt', scope: CELLAR_READ_SCOPE },
      resourceUrl
    );

    await expect(
      verifyMcpBearer(new Request(`${resourceUrl}/api/mcp`), token)
    ).resolves.toEqual({
      token,
      scopes: [CELLAR_READ_SCOPE],
      clientId: 'chatgpt',
      extra: { userId: 'user-1' },
    });
  });

  it('rejects an unknown bearer token', async () => {
    await expect(
      verifyMcpBearer(new Request(`${resourceUrl}/api/mcp`), 'nope')
    ).resolves.toBeUndefined();
  });
});

describe('userIdFromAuth', () => {
  it('reads the user id from auth extra', () => {
    expect(
      userIdFromAuth({
        token: 't',
        scopes: [CELLAR_READ_SCOPE],
        clientId: 'c',
        extra: { userId: 'user-1' },
      })
    ).toBe('user-1');
    expect(userIdFromAuth(undefined)).toBeNull();
  });
});
