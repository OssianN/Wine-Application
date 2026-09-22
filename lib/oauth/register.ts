import { createOAuthClient } from '@/mongoDB/oauthStore';
import { CELLAR_READ_SCOPE } from './constants';
import { isHttpsPublicUrl } from './urls';

type RegistrationBody = {
  redirect_uris?: unknown;
};

export const parseRedirectUris = (value: unknown) => {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  return values.filter((uri): uri is string => typeof uri === 'string');
};

export const registerOAuthClient = async (body: RegistrationBody) => {
  const redirectUris = parseRedirectUris(body.redirect_uris);
  if (!redirectUris.length || redirectUris.some(uri => !isHttpsPublicUrl(uri))) {
    return {
      ok: false as const,
      status: 400,
      body: {
        error: 'invalid_redirect_uri',
        error_description: 'redirect_uris must be public https URLs',
      },
    };
  }

  const client = await createOAuthClient(redirectUris);
  return {
    ok: true as const,
    status: 201,
    body: {
      client_id: client.clientId,
      redirect_uris: client.redirectUris,
      token_endpoint_auth_method: 'none',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      scope: CELLAR_READ_SCOPE,
    },
  };
};
