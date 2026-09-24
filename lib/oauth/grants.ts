import {
  consumeAuthorizationCode,
  createRefreshToken,
  findRefreshToken,
} from '@/mongoDB/oauthStore';
import { CELLAR_READ_SCOPE } from './constants';
import { safeEqual, verifyPkceS256 } from './crypto';
import { signAccessToken } from './jwt';
import { resourceMatches } from './urls';

type TokenSuccess = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token?: string;
  scope: string;
};

type TokenFailure = {
  error: string;
  error_description: string;
};

type TokenResult =
  | { ok: true; status: 200; body: TokenSuccess }
  | { ok: false; status: 400; body: TokenFailure };

const failure = (description: string, error = 'invalid_grant'): TokenResult => ({
  ok: false,
  status: 400,
  body: { error, error_description: description },
});

export const exchangeAuthorizationCode = async ({
  code,
  redirectUri,
  clientId,
  codeVerifier,
  resource,
  resourceUrl,
}: {
  code?: string;
  redirectUri?: string;
  clientId?: string;
  codeVerifier?: string;
  resource?: string;
  resourceUrl: string;
}): Promise<TokenResult> => {
  if (!code || !redirectUri || !clientId || !codeVerifier) {
    return failure('code, redirect_uri, client_id, and code_verifier are required', 'invalid_request');
  }

  const stored = await consumeAuthorizationCode(code);
  if (!stored) {
    return failure('Authorization code is invalid or expired');
  }

  if (!safeEqual(stored.clientId, clientId) || stored.redirectUri !== redirectUri) {
    return failure('Authorization code does not match this client');
  }

  if (!verifyPkceS256(codeVerifier, stored.codeChallenge)) {
    return failure('PKCE verification failed');
  }

  if (resource && !resourceMatches(resource, resourceUrl)) {
    return failure('resource does not match this cellar', 'invalid_request');
  }

  const accessToken = await signAccessToken(
    {
      userId: stored.userId,
      clientId: stored.clientId,
      scope: stored.scope,
    },
    resourceUrl
  );
  const refreshToken = await createRefreshToken({
    userId: stored.userId,
    clientId: stored.clientId,
    scope: stored.scope,
  });

  return {
    ok: true,
    status: 200,
    body: {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 60 * 60,
      refresh_token: refreshToken,
      scope: stored.scope,
    },
  };
};

export const exchangeRefreshToken = async ({
  refreshToken,
  clientId,
  resource,
  resourceUrl,
}: {
  refreshToken?: string;
  clientId?: string;
  resource?: string;
  resourceUrl: string;
}): Promise<TokenResult> => {
  if (!refreshToken || !clientId) {
    return failure('refresh_token and client_id are required', 'invalid_request');
  }

  const stored = await findRefreshToken(refreshToken);
  if (!stored) {
    return failure('Refresh token is invalid or revoked');
  }

  if (!safeEqual(stored.clientId, clientId)) {
    return failure('Refresh token does not match this client');
  }

  if (resource && !resourceMatches(resource, resourceUrl)) {
    return failure('resource does not match this cellar', 'invalid_request');
  }

  const accessToken = await signAccessToken(
    {
      userId: stored.userId,
      clientId: stored.clientId,
      scope: stored.scope || CELLAR_READ_SCOPE,
    },
    resourceUrl
  );

  return {
    ok: true,
    status: 200,
    body: {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 60 * 60,
      scope: stored.scope || CELLAR_READ_SCOPE,
    },
  };
};
