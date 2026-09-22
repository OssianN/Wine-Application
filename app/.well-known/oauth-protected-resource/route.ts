import {
  metadataCorsOptionsRequestHandler,
  protectedResourceHandler,
} from 'mcp-handler';
import { resolveResourceUrl } from '@/lib/oauth/urls';

export const dynamic = 'force-dynamic';

export function GET(req: Request) {
  const issuer = resolveResourceUrl(req);
  const handler = protectedResourceHandler({
    authServerUrls: [issuer],
    resourceUrl: issuer,
  });
  return handler(req);
}

export const OPTIONS = metadataCorsOptionsRequestHandler();
