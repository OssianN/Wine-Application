import { createOAuthClient } from '@/mongoDB/oauthStore';
import { parseRedirectUris, registerOAuthClient } from './register';

jest.mock('@/mongoDB/oauthStore', () => ({
  createOAuthClient: jest.fn(),
}));

const mockCreate = createOAuthClient as jest.MockedFunction<
  typeof createOAuthClient
>;

describe('parseRedirectUris', () => {
  it('accepts an array or a single string', () => {
    expect(parseRedirectUris(['https://grok.com/cb'])).toEqual([
      'https://grok.com/cb',
    ]);
    expect(parseRedirectUris('https://grok.com/cb')).toEqual([
      'https://grok.com/cb',
    ]);
  });
});

describe('registerOAuthClient', () => {
  beforeEach(() => {
    mockCreate.mockResolvedValue({
      clientId: 'new-client',
      redirectUris: ['https://grok.com/connectors/oauth'],
    });
  });

  it('registers a public PKCE client from Grok metadata', async () => {
    const result = await registerOAuthClient({
      redirect_uris: ['https://grok.com/connectors/oauth'],
    });

    expect(result).toMatchObject({
      ok: true,
      status: 201,
      body: { client_id: 'new-client', token_endpoint_auth_method: 'none' },
    });
  });

  it('rejects a private or http redirect', async () => {
    await expect(
      registerOAuthClient({ redirect_uris: ['http://localhost/cb'] })
    ).resolves.toMatchObject({ ok: false, status: 400 });
  });
});
