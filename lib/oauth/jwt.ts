import { createHmac } from 'crypto';
import { ACCESS_TOKEN_TTL_SECONDS, CELLAR_READ_SCOPE } from './constants';
import { safeEqual } from './crypto';
import { getJwtSecret } from './urls';

type AccessTokenClaims = {
  userId: string;
  clientId: string;
  scope: string;
};

type JwtPayload = {
  sub: string;
  client_id: string;
  scope: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
};

const encode = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

const decode = <T>(value: string): T =>
  JSON.parse(Buffer.from(value, 'base64url').toString()) as T;

const sign = (data: string, secret: string) =>
  createHmac('sha256', secret).update(data).digest('base64url');

export const signAccessToken = async (
  claims: AccessTokenClaims,
  resourceUrl: string
) => {
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: claims.userId,
    client_id: claims.clientId,
    scope: claims.scope,
    iss: resourceUrl,
    aud: resourceUrl,
    iat: now,
    exp: now + ACCESS_TOKEN_TTL_SECONDS,
  };
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const body = encode(payload);
  const data = `${header}.${body}`;
  return `${data}.${sign(data, getJwtSecret())}`;
};

export const verifyAccessToken = async (
  token: string,
  resourceUrl: string
): Promise<AccessTokenClaims | null> => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [header, body, signature] = parts;
  const data = `${header}.${body}`;
  if (!safeEqual(signature, sign(data, getJwtSecret()))) {
    return null;
  }

  try {
    const payload = decode<JwtPayload>(body);
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return null;
    }
    if (payload.iss !== resourceUrl || payload.aud !== resourceUrl) {
      return null;
    }
    if (typeof payload.sub !== 'string' || !payload.sub) {
      return null;
    }
    const scope = typeof payload.scope === 'string' ? payload.scope : '';
    if (!scope.split(/[\s+]+/).includes(CELLAR_READ_SCOPE)) {
      return null;
    }
    return {
      userId: payload.sub,
      clientId: typeof payload.client_id === 'string' ? payload.client_id : '',
      scope: CELLAR_READ_SCOPE,
    };
  } catch {
    return null;
  }
};
