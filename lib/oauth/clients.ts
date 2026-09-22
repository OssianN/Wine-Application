import { findOAuthClient, type StoredClient } from '@/mongoDB/oauthStore';
import { isHttpsPublicUrl } from './urls';

type ClientIdMetadata = {
  client_id?: string;
  redirect_uris?: string[];
};

const isCimdClientId = (clientId: string) =>
  clientId.startsWith('https://') && isHttpsPublicUrl(clientId);

const parseRedirectUris = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (uri): uri is string => typeof uri === 'string' && isHttpsPublicUrl(uri)
  );
};

export const loadOAuthClient = async (
  clientId: string
): Promise<StoredClient | null> => {
  if (!clientId) {
    return null;
  }

  if (isCimdClientId(clientId)) {
    try {
      const response = await fetch(clientId, {
        headers: { accept: 'application/json' },
        redirect: 'error',
        signal:
          typeof AbortSignal.timeout === 'function'
            ? AbortSignal.timeout(5000)
            : undefined,
      });
      if (!response.ok) {
        return null;
      }

      const metadata = (await response.json()) as ClientIdMetadata;
      if (metadata.client_id && metadata.client_id !== clientId) {
        return null;
      }

      const redirectUris = parseRedirectUris(metadata.redirect_uris);
      if (!redirectUris.length) {
        return null;
      }

      return { clientId, redirectUris };
    } catch {
      return null;
    }
  }

  return findOAuthClient(clientId);
};

export const clientAllowsRedirect = (
  client: StoredClient,
  redirectUri: string
) => client.redirectUris.includes(redirectUri);
