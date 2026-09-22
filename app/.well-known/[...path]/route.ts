import { oauthJson, oauthOptions } from '@/lib/oauth/cors';
import {
  authorizationServerMetadata,
  protectedResourceMetadata,
} from '@/lib/oauth/metadata';
import { resolveResourceUrl } from '@/lib/oauth/urls';

export const dynamic = 'force-dynamic';

const firstSegment = (path: string[]) => path[0] ?? '';

export async function GET(
  req: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const issuer = resolveResourceUrl(req);
  const document = firstSegment(path);

  if (
    document === 'oauth-authorization-server' ||
    document === 'openid-configuration'
  ) {
    return oauthJson(authorizationServerMetadata(issuer));
  }

  if (document === 'oauth-protected-resource') {
    return oauthJson(protectedResourceMetadata(issuer));
  }

  return oauthJson({ error: 'not_found' }, 404);
}

export function OPTIONS() {
  return oauthOptions();
}
