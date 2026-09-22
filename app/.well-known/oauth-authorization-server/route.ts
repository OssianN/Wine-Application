import { CELLAR_READ_SCOPE } from '@/lib/oauth/constants';
import { oauthJson, oauthOptions } from '@/lib/oauth/cors';
import { resolveResourceUrl } from '@/lib/oauth/urls';

export const dynamic = 'force-dynamic';

const metadata = (issuer: string) => ({
  issuer,
  authorization_endpoint: `${issuer}/oauth/authorize`,
  token_endpoint: `${issuer}/oauth/token`,
  registration_endpoint: `${issuer}/oauth/register`,
  response_types_supported: ['code'],
  grant_types_supported: ['authorization_code', 'refresh_token'],
  code_challenge_methods_supported: ['S256'],
  token_endpoint_auth_methods_supported: ['none'],
  scopes_supported: [CELLAR_READ_SCOPE],
  client_id_metadata_document_supported: true,
});

export function GET(req: Request) {
  return oauthJson(metadata(resolveResourceUrl(req)));
}

export function OPTIONS() {
  return oauthOptions();
}
