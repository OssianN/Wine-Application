import { oauthJson, oauthOptions } from '@/lib/oauth/cors';
import { registerOAuthClient } from '@/lib/oauth/register';

export const dynamic = 'force-dynamic';

const readBody = async (req: Request) => {
  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const form = await req.formData();
    return {
      redirect_uris: form.getAll('redirect_uris'),
    };
  }
  return (await req.json()) as { redirect_uris?: unknown };
};

export async function POST(req: Request) {
  let body: { redirect_uris?: unknown };
  try {
    body = await readBody(req);
  } catch {
    return oauthJson(
      { error: 'invalid_client_metadata', error_description: 'JSON body required' },
      400
    );
  }

  const result = await registerOAuthClient(body);
  return oauthJson(result.body, result.status);
}

export function OPTIONS() {
  return oauthOptions();
}
