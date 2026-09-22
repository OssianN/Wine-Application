import { AUTHORIZATION_CODE_TTL_MS } from '@/lib/oauth/constants';
import { randomToken, sha256Hex } from '@/lib/oauth/crypto';
import { connectMongo } from './';
import {
  OAuthAuthorizationCode,
  OAuthClient,
  OAuthRefreshToken,
} from './oauth-schema';

export type StoredAuthorizationCode = {
  userId: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  resource: string;
  scope: string;
};

export type StoredRefreshToken = {
  userId: string;
  clientId: string;
  scope: string;
};

export type StoredClient = {
  clientId: string;
  redirectUris: string[];
};

export const createAuthorizationCode = async (
  values: StoredAuthorizationCode
) => {
  await connectMongo();
  const code = randomToken();
  await OAuthAuthorizationCode.create({
    codeHash: sha256Hex(code),
    ...values,
    expiresAt: new Date(Date.now() + AUTHORIZATION_CODE_TTL_MS),
    consumed: false,
  });
  return code;
};

export const consumeAuthorizationCode = async (
  code: string
): Promise<StoredAuthorizationCode | null> => {
  await connectMongo();
  const doc = await OAuthAuthorizationCode.findOneAndUpdate(
    {
      codeHash: sha256Hex(code),
      consumed: false,
      expiresAt: { $gt: new Date() },
    },
    { $set: { consumed: true } },
    { new: true }
  ).lean();

  if (!doc) {
    return null;
  }

  return {
    userId: doc.userId,
    clientId: doc.clientId,
    redirectUri: doc.redirectUri,
    codeChallenge: doc.codeChallenge,
    resource: doc.resource,
    scope: doc.scope,
  };
};

export const createRefreshToken = async (values: StoredRefreshToken) => {
  await connectMongo();
  const token = randomToken();
  await OAuthRefreshToken.create({
    tokenHash: sha256Hex(token),
    ...values,
    revoked: false,
  });
  return token;
};

export const findRefreshToken = async (
  token: string
): Promise<StoredRefreshToken | null> => {
  await connectMongo();
  const doc = await OAuthRefreshToken.findOne({
    tokenHash: sha256Hex(token),
    revoked: false,
  }).lean();

  if (!doc) {
    return null;
  }

  return {
    userId: doc.userId,
    clientId: doc.clientId,
    scope: doc.scope,
  };
};

export const createOAuthClient = async (redirectUris: string[]) => {
  await connectMongo();
  const clientId = randomToken(16);
  await OAuthClient.create({
    clientId,
    redirectUris,
    tokenEndpointAuthMethod: 'none',
  });
  return { clientId, redirectUris };
};

export const findOAuthClient = async (
  clientId: string
): Promise<StoredClient | null> => {
  await connectMongo();
  const doc = await OAuthClient.findOne({ clientId }).lean();
  if (!doc) {
    return null;
  }
  return {
    clientId: doc.clientId,
    redirectUris: doc.redirectUris,
  };
};
