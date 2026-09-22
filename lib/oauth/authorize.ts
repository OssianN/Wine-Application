import { CELLAR_READ_SCOPE } from './constants';
import { resourceMatches } from './urls';

export type AuthorizeQuery = {
  response_type?: string;
  client_id?: string;
  redirect_uri?: string;
  code_challenge?: string;
  code_challenge_method?: string;
  state?: string;
  resource?: string;
  scope?: string;
};

export type ValidAuthorizeRequest = {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string | null;
  resource: string;
  scope: typeof CELLAR_READ_SCOPE;
};

export type AuthorizeValidation =
  | { ok: true; request: ValidAuthorizeRequest }
  | { ok: false; error: string; description: string };

const requestedScopes = (scope?: string) =>
  (scope ?? CELLAR_READ_SCOPE)
    .split(/[\s+]+/)
    .map(value => value.trim())
    .filter(Boolean);

export const validateAuthorizeQuery = (
  query: AuthorizeQuery,
  resourceUrl: string
): AuthorizeValidation => {
  if (query.response_type !== 'code') {
    return {
      ok: false,
      error: 'unsupported_response_type',
      description: 'Only the authorization code flow is supported',
    };
  }

  if (!query.client_id) {
    return {
      ok: false,
      error: 'invalid_request',
      description: 'client_id is required',
    };
  }

  if (!query.redirect_uri) {
    return {
      ok: false,
      error: 'invalid_request',
      description: 'redirect_uri is required',
    };
  }

  if (!query.code_challenge) {
    return {
      ok: false,
      error: 'invalid_request',
      description: 'PKCE code_challenge is required',
    };
  }

  if (query.code_challenge_method !== 'S256') {
    return {
      ok: false,
      error: 'invalid_request',
      description: 'code_challenge_method must be S256',
    };
  }

  const scopes = requestedScopes(query.scope);
  if (!scopes.includes(CELLAR_READ_SCOPE) || scopes.some(scope => scope !== CELLAR_READ_SCOPE)) {
    return {
      ok: false,
      error: 'invalid_scope',
      description: `Only ${CELLAR_READ_SCOPE} is supported`,
    };
  }

  if (!resourceMatches(query.resource ?? null, resourceUrl)) {
    return {
      ok: false,
      error: 'invalid_request',
      description: 'resource does not match this cellar',
    };
  }

  return {
    ok: true,
    request: {
      clientId: query.client_id,
      redirectUri: query.redirect_uri,
      codeChallenge: query.code_challenge,
      state: query.state ?? null,
      resource: query.resource ? query.resource.replace(/\/$/, '') : resourceUrl,
      scope: CELLAR_READ_SCOPE,
    },
  };
};

export const authorizeRedirect = (
  redirectUri: string,
  params: Record<string, string | null | undefined>
) => {
  const url = new URL(redirectUri);
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
};

export const authorizePagePath = (request: ValidAuthorizeRequest) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: request.clientId,
    redirect_uri: request.redirectUri,
    code_challenge: request.codeChallenge,
    code_challenge_method: 'S256',
    resource: request.resource,
    scope: request.scope,
  });
  if (request.state) {
    params.set('state', request.state);
  }
  return `/oauth/authorize?${params.toString()}`;
};
