/**
 * @jest-environment node
 */

import { CELLAR_READ_SCOPE } from '@/lib/oauth/constants';
import { signAccessToken } from '@/lib/oauth/jwt';
import { findUserIdByEmail } from '@/mongoDB/findUserIdByEmail';
import { userIdFromAuth, verifyMcpBearer } from './verifyAccess';

jest.mock('@/mongoDB/findUserIdByEmail', () => ({
  findUserIdByEmail: jest.fn(),
}));

const mockFindUserIdByEmail = findUserIdByEmail as jest.MockedFunction<
  typeof findUserIdByEmail
>;

describe('verifyMcpBearer', () => {
  const resourceUrl = 'https://wine.example';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MCP_JWT_SECRET = 'test-jwt-secret-key';
    process.env.MCP_RESOURCE_URL = resourceUrl;
    delete process.env.MCP_ACCESS_TOKEN;
    delete process.env.MCP_USER_EMAIL;
  });

  it('accepts a JWT minted for this resource', async () => {
    const token = await signAccessToken(
      { userId: 'user-1', clientId: 'chatgpt', scope: CELLAR_READ_SCOPE },
      resourceUrl
    );

    await expect(
      verifyMcpBearer(new Request(`${resourceUrl}/mcp`), token)
    ).resolves.toEqual({
      token,
      scopes: [CELLAR_READ_SCOPE],
      clientId: 'chatgpt',
      extra: { userId: 'user-1' },
    });
  });

  it('accepts the static token for the configured user', async () => {
    process.env.MCP_ACCESS_TOKEN = 'static-token';
    process.env.MCP_USER_EMAIL = 'ossian@example.com';
    mockFindUserIdByEmail.mockResolvedValue('user-9');

    await expect(
      verifyMcpBearer(new Request(`${resourceUrl}/mcp`), 'static-token')
    ).resolves.toMatchObject({
      clientId: 'static',
      extra: { userId: 'user-9' },
    });
  });

  it('rejects an unknown bearer token', async () => {
    await expect(
      verifyMcpBearer(new Request(`${resourceUrl}/mcp`), 'nope')
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
