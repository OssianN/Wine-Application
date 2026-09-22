import { oauthJson, oauthOptions } from '@/lib/oauth/cors';
import { isHttpsPublicUrl } from '@/lib/oauth/urls';
import { createOAuthClient } from '@/mongoDB/oauthStore';

export const dynamic = 'force-dynamic';

type RegistrationBody = {
  redirect_uris?: unknown;
  token_endpoint_auth_method?: unknown;
};

const parseRedirectUris = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((uri): uri is string => typeof uri === 'string');
};

export async function POST(req: Request) {
  let body: RegistrationBody;
  try {
    body = (await req.json()) as RegistrationBody;
  } catch {
    return oauthJson(
      { error: 'invalid_client_metadata', error_description: 'JSON body required' },
      400
    );
  }

  const redirectUris = parseRedirectUris(body.redirect_uris);
  if (!redirectUris.length || redirectUris.some(uri => !isHttpsPublicUrl(uri))) {
    return oauthJson(
      {
        error: 'invalid_redirect_uri',
        error_description: 'redirect_uris must be public https URLs',
      },
      400
    );
  }

  if (
    body.token_endpoint_auth_method &&
    body.token_endpoint_auth_method !== 'none'
  ) {
    return oauthJson(
      {
        error: 'invalid_client_metadata',
        error_description: 'Only public clients (token_endpoint_auth_method=none) are supported',
      },
      400
    );
  }

  const client = await createOAuthClient(redirectUris);
  return oauthJson(
    {
      client_id: client.clientId,
      redirect_uris: client.redirectUris,
      token_endpoint_auth_method: 'none',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
    },
    201
  );
}

export function OPTIONS() {
  return oauthOptions();
}
