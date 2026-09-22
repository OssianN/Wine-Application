import { isSafeOauthReturnTo, loginUrlForAuthorize } from './returnTo';

describe('isSafeOauthReturnTo', () => {
  it('accepts the authorize path and its query string', () => {
    expect(isSafeOauthReturnTo('/oauth/authorize')).toBe(true);
    expect(
      isSafeOauthReturnTo(
        '/oauth/authorize?client_id=abc&redirect_uri=https://chatgpt.com/connector/oauth/x'
      )
    ).toBe(true);
  });

  it('rejects anything that is not the authorize path', () => {
    expect(isSafeOauthReturnTo('/dashboard')).toBe(false);
    expect(isSafeOauthReturnTo('/oauth/authorize/extra')).toBe(false);
    expect(isSafeOauthReturnTo('//evil.example/oauth/authorize')).toBe(false);
    expect(isSafeOauthReturnTo('/oauth/authorize\\@evil')).toBe(false);
    expect(isSafeOauthReturnTo('https://example.com/oauth/authorize')).toBe(
      false
    );
    expect(isSafeOauthReturnTo(undefined)).toBe(false);
  });
});

describe('loginUrlForAuthorize', () => {
  it('encodes the return path as a query value', () => {
    expect(
      loginUrlForAuthorize('/oauth/authorize?client_id=abc')
    ).toBe('/login?returnTo=%2Foauth%2Fauthorize%3Fclient_id%3Dabc');
  });
});
