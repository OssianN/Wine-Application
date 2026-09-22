import { clientAllowsRedirect, loadOAuthClient } from './clients';
import { findOAuthClient } from '@/mongoDB/oauthStore';

jest.mock('@/mongoDB/oauthStore', () => ({
  findOAuthClient: jest.fn(),
}));

const mockFindOAuthClient = findOAuthClient as jest.MockedFunction<
  typeof findOAuthClient
>;

describe('loadOAuthClient', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('loads a Client ID Metadata Document over https', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        client_id: 'https://chatgpt.com/oauth/client.json',
        redirect_uris: ['https://chatgpt.com/connector/oauth/callback'],
      }),
    }) as typeof fetch;

    await expect(
      loadOAuthClient('https://chatgpt.com/oauth/client.json')
    ).resolves.toEqual({
      clientId: 'https://chatgpt.com/oauth/client.json',
      redirectUris: ['https://chatgpt.com/connector/oauth/callback'],
    });
    expect(mockFindOAuthClient).not.toHaveBeenCalled();
  });

  it('rejects CIMD documents that point at a different client', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        client_id: 'https://other.example/client.json',
        redirect_uris: ['https://chatgpt.com/connector/oauth/callback'],
      }),
    }) as typeof fetch;

    await expect(
      loadOAuthClient('https://chatgpt.com/oauth/client.json')
    ).resolves.toBeNull();
  });

  it('looks up dynamically registered clients', async () => {
    mockFindOAuthClient.mockResolvedValue({
      clientId: 'registered-1',
      redirectUris: ['https://grok.com/oauth/callback'],
    });

    await expect(loadOAuthClient('registered-1')).resolves.toEqual({
      clientId: 'registered-1',
      redirectUris: ['https://grok.com/oauth/callback'],
    });
  });
});

describe('clientAllowsRedirect', () => {
  it('requires an exact registered redirect URI', () => {
    const client = {
      clientId: 'c1',
      redirectUris: ['https://chatgpt.com/connector/oauth/x'],
    };
    expect(
      clientAllowsRedirect(client, 'https://chatgpt.com/connector/oauth/x')
    ).toBe(true);
    expect(
      clientAllowsRedirect(client, 'https://chatgpt.com/connector/oauth/y')
    ).toBe(false);
  });
});
