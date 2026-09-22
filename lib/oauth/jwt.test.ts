/**
 * @jest-environment node
 */

import { createHmac } from 'crypto';
import { CELLAR_READ_SCOPE } from './constants';
import { signAccessToken, verifyAccessToken } from './jwt';

const encode = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

describe('access tokens', () => {
  const resourceUrl = 'https://wine.example';

  beforeEach(() => {
    process.env.MCP_JWT_SECRET = 'test-jwt-secret-key';
  });

  it('round-trips a cellar:read token for one user', async () => {
    const token = await signAccessToken(
      {
        userId: 'user-1',
        clientId: 'chatgpt',
        scope: CELLAR_READ_SCOPE,
      },
      resourceUrl
    );

    await expect(verifyAccessToken(token, resourceUrl)).resolves.toEqual({
      userId: 'user-1',
      clientId: 'chatgpt',
      scope: CELLAR_READ_SCOPE,
    });
  });

  it('rejects a token minted for another resource', async () => {
    const token = await signAccessToken(
      {
        userId: 'user-1',
        clientId: 'chatgpt',
        scope: CELLAR_READ_SCOPE,
      },
      resourceUrl
    );

    await expect(
      verifyAccessToken(token, 'https://other.example')
    ).resolves.toBeNull();
  });

  it('rejects a token without cellar:read', async () => {
    const header = encode({ alg: 'HS256', typ: 'JWT' });
    const now = Math.floor(Date.now() / 1000);
    const body = encode({
      sub: 'user-1',
      client_id: 'chatgpt',
      scope: 'other',
      iss: resourceUrl,
      aud: resourceUrl,
      iat: now,
      exp: now + 3600,
    });
    const data = `${header}.${body}`;
    const signature = createHmac('sha256', 'test-jwt-secret-key')
      .update(data)
      .digest('base64url');

    await expect(
      verifyAccessToken(`${data}.${signature}`, resourceUrl)
    ).resolves.toBeNull();
  });
});
