import { CELLAR_READ_SCOPE } from './constants';

export const mcpResourceIdentifier = (issuer: string) => `${issuer}/api/mcp`;

export const authorizationServerMetadata = (issuer: string) => ({
  issuer,
  authorization_endpoint: `${issuer}/authorize`,
  token_endpoint: `${issuer}/token`,
  registration_endpoint: `${issuer}/register`,
  response_types_supported: ['code'],
  grant_types_supported: ['authorization_code', 'refresh_token'],
  code_challenge_methods_supported: ['S256'],
  token_endpoint_auth_methods_supported: ['none'],
  scopes_supported: [CELLAR_READ_SCOPE],
  client_id_metadata_document_supported: true,
});

export const protectedResourceMetadata = (issuer: string) => ({
  resource: mcpResourceIdentifier(issuer),
  authorization_servers: [issuer],
  scopes_supported: [CELLAR_READ_SCOPE],
  bearer_methods_supported: ['header'],
});
