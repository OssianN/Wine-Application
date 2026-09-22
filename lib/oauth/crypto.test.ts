import { randomToken, safeEqual, sha256Base64Url, verifyPkceS256 } from './crypto';

describe('oauth crypto', () => {
  it('verifies an S256 PKCE challenge', () => {
    const verifier = 'a'.repeat(43);
    const challenge = sha256Base64Url(verifier);
    expect(verifyPkceS256(verifier, challenge)).toBe(true);
    expect(verifyPkceS256(`${verifier}x`, challenge)).toBe(false);
    expect(verifyPkceS256('', challenge)).toBe(false);
  });

  it('compares secrets in constant-looking time', () => {
    expect(safeEqual('token', 'token')).toBe(true);
    expect(safeEqual('token', 'other')).toBe(false);
    expect(safeEqual('short', 'longer-value')).toBe(false);
  });

  it('creates unique opaque tokens', () => {
    expect(randomToken()).not.toBe(randomToken());
  });
});
