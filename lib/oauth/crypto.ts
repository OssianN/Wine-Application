import { createHash, randomBytes, timingSafeEqual } from 'crypto';

export const sha256Hex = (value: string) =>
  createHash('sha256').update(value).digest('hex');

export const sha256Base64Url = (value: string) =>
  createHash('sha256').update(value).digest('base64url');

export const randomToken = (bytes = 32) =>
  randomBytes(bytes).toString('base64url');

export const safeEqual = (left: string, right: string) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
};

export const verifyPkceS256 = (verifier: string, challenge: string) => {
  if (!verifier || !challenge) {
    return false;
  }
  return safeEqual(sha256Base64Url(verifier), challenge);
};
