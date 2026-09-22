import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { CELLAR_READ_SCOPE, MCP_STATIC_CLIENT_ID } from '@/lib/oauth/constants';
import { safeEqual } from '@/lib/oauth/crypto';
import { verifyAccessToken } from '@/lib/oauth/jwt';
import { resolveResourceUrl } from '@/lib/oauth/urls';
import { findUserIdByEmail } from '@/mongoDB/findUserIdByEmail';

export const verifyMcpBearer = async (
  req: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> => {
  if (!bearerToken) {
    return undefined;
  }

  const staticToken = process.env.MCP_ACCESS_TOKEN;
  const staticEmail = process.env.MCP_USER_EMAIL;
  if (staticToken && staticEmail && safeEqual(bearerToken, staticToken)) {
    const userId = await findUserIdByEmail(staticEmail);
    if (!userId) {
      return undefined;
    }
    return {
      token: bearerToken,
      scopes: [CELLAR_READ_SCOPE],
      clientId: MCP_STATIC_CLIENT_ID,
      extra: { userId },
    };
  }

  const claims = await verifyAccessToken(bearerToken, resolveResourceUrl(req));
  if (!claims) {
    return undefined;
  }

  return {
    token: bearerToken,
    scopes: [CELLAR_READ_SCOPE],
    clientId: claims.clientId,
    extra: { userId: claims.userId },
  };
};

export const userIdFromAuth = (authInfo?: AuthInfo) => {
  const extra = authInfo?.extra;
  if (!extra || typeof extra !== 'object' || !('userId' in extra)) {
    return null;
  }
  return typeof extra.userId === 'string' ? extra.userId : null;
};
