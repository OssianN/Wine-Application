import {
  authorizationServerMetadata,
  mcpResourceIdentifier,
  protectedResourceMetadata,
} from './metadata';

describe('oauth metadata', () => {
  const issuer = 'https://wine.example';

  it('advertises the short OAuth paths Grok discovers', () => {
    expect(authorizationServerMetadata(issuer)).toMatchObject({
      issuer,
      authorization_endpoint: `${issuer}/authorize`,
      token_endpoint: `${issuer}/token`,
      registration_endpoint: `${issuer}/oauth/register`,
    });
  });

  it('names the MCP route as the protected resource', () => {
    expect(mcpResourceIdentifier(issuer)).toBe(`${issuer}/api/mcp`);
    expect(protectedResourceMetadata(issuer)).toMatchObject({
      resource: `${issuer}/api/mcp`,
      authorization_servers: [issuer],
    });
  });
});
