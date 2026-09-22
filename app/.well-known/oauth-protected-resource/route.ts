import { oauthJson, oauthOptions } from '@/lib/oauth/cors';
import { protectedResourceMetadata } from '@/lib/oauth/metadata';
import { resolveResourceUrl } from '@/lib/oauth/urls';

export const dynamic = 'force-dynamic';

export function GET(req: Request) {
  return oauthJson(protectedResourceMetadata(resolveResourceUrl(req)));
}

export function OPTIONS() {
  return oauthOptions();
}
