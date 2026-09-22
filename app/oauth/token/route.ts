import { oauthJson, oauthOptions } from '@/lib/oauth/cors';
import {
  exchangeAuthorizationCode,
  exchangeRefreshToken,
} from '@/lib/oauth/grants';
import { resolveResourceUrl } from '@/lib/oauth/urls';

export const dynamic = 'force-dynamic';

const readField = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === 'string' ? value : undefined;
};

export async function POST(req: Request) {
  try {
    const resourceUrl = resolveResourceUrl(req);
    const form = await req.formData();
    const grantType = readField(form, 'grant_type');

    const result =
      grantType === 'authorization_code'
        ? await exchangeAuthorizationCode({
            code: readField(form, 'code'),
            redirectUri: readField(form, 'redirect_uri'),
            clientId: readField(form, 'client_id'),
            codeVerifier: readField(form, 'code_verifier'),
            resource: readField(form, 'resource'),
            resourceUrl,
          })
        : grantType === 'refresh_token'
          ? await exchangeRefreshToken({
              refreshToken: readField(form, 'refresh_token'),
              clientId: readField(form, 'client_id'),
              resource: readField(form, 'resource'),
              resourceUrl,
            })
          : {
              ok: false as const,
              status: 400,
              body: {
                error: 'unsupported_grant_type',
                error_description:
                  'Only authorization_code and refresh_token are supported',
              },
            };

    return oauthJson(result.body, result.status);
  } catch (error) {
    return oauthJson(
      {
        error: 'server_error',
        error_description:
          error instanceof Error ? error.message : 'Token endpoint failed',
      },
      500
    );
  }
}

export function OPTIONS() {
  return oauthOptions();
}
