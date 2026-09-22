import { authorizePagePath, validateAuthorizeQuery } from './authorize';

const baseQuery = {
  response_type: 'code',
  client_id: 'https://chatgpt.com/oauth/client.json',
  redirect_uri: 'https://chatgpt.com/connector/oauth/x',
  code_challenge: 'abc',
  code_challenge_method: 'S256',
  state: 'state-1',
};

describe('validateAuthorizeQuery', () => {
  it('accepts a PKCE authorization-code request', () => {
    expect(
      validateAuthorizeQuery(baseQuery, 'https://wine.example')
    ).toEqual({
      ok: true,
      request: {
        clientId: baseQuery.client_id,
        redirectUri: baseQuery.redirect_uri,
        codeChallenge: 'abc',
        state: 'state-1',
        resource: 'https://wine.example',
        scope: 'cellar:read',
      },
    });
  });

  it('rejects a missing PKCE challenge or the wrong method', () => {
    expect(
      validateAuthorizeQuery(
        { ...baseQuery, code_challenge: undefined },
        'https://wine.example'
      )
    ).toMatchObject({ ok: false, error: 'invalid_request' });
    expect(
      validateAuthorizeQuery(
        { ...baseQuery, code_challenge_method: 'plain' },
        'https://wine.example'
      )
    ).toMatchObject({ ok: false, error: 'invalid_request' });
  });

  it('rejects an unknown scope or resource', () => {
    expect(
      validateAuthorizeQuery(
        { ...baseQuery, scope: 'cellar:write' },
        'https://wine.example'
      )
    ).toMatchObject({ ok: false, error: 'invalid_scope' });
    expect(
      validateAuthorizeQuery(
        { ...baseQuery, resource: 'https://other.example' },
        'https://wine.example'
      )
    ).toMatchObject({ ok: false, error: 'invalid_request' });
  });
});

describe('authorizePagePath', () => {
  it('rebuilds the authorize URL from a valid request', () => {
    const path = authorizePagePath({
      clientId: baseQuery.client_id,
      redirectUri: baseQuery.redirect_uri,
      codeChallenge: 'abc',
      state: 'state-1',
      resource: 'https://wine.example',
      scope: 'cellar:read',
    });

    expect(path.startsWith('/oauth/authorize?')).toBe(true);
    expect(path).toContain('client_id=');
    expect(path).toContain('code_challenge=abc');
    expect(path).toContain('state=state-1');
  });
});
