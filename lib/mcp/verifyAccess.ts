import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { CELLAR_READ_SCOPE } from '@/lib/oauth/constants';
import { verifyAccessToken } from '@/lib/oauth/jwt';
import { resolveResourceUrl } from '@/lib/oauth/urls';

export const verifyMcpBearer = async (
  req: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> => {
  if (!bearerToken) {
    return undefined;
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
