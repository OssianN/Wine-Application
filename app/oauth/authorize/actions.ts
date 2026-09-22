'use server';

import {
  authorizePagePath,
  authorizeRedirect,
  validateAuthorizeQuery,
} from '@/lib/oauth/authorize';
import { clientAllowsRedirect, loadOAuthClient } from '@/lib/oauth/clients';
import { resolveResourceUrlFromHeaders } from '@/lib/oauth/urls';
import { loginFormSchema } from '@/lib/schemas';
import { getUserSession } from '@/lib/session';
import { getDbUser } from '@/mongoDB/getDbUser';
import { createAuthorizationCode } from '@/mongoDB/oauthStore';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export type AuthorizeLoginState = {
  error?: string;
};

const read = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : undefined;
};

const validatedConsentRequest = async (formData: FormData) => {
  const resourceUrl = resolveResourceUrlFromHeaders(await headers());
  const validation = validateAuthorizeQuery(
    {
      response_type: read(formData, 'response_type'),
      client_id: read(formData, 'client_id'),
      redirect_uri: read(formData, 'redirect_uri'),
      code_challenge: read(formData, 'code_challenge'),
      code_challenge_method: read(formData, 'code_challenge_method'),
      state: read(formData, 'state'),
      resource: read(formData, 'resource'),
      scope: read(formData, 'scope'),
    },
    resourceUrl
  );

  if (!validation.ok) {
    return { ok: false as const, error: validation.description };
  }

  const client = await loadOAuthClient(validation.request.clientId);
  if (!client || !clientAllowsRedirect(client, validation.request.redirectUri)) {
    return { ok: false as const, error: 'Unknown OAuth client or redirect URI' };
  }

  return { ok: true as const, request: validation.request };
};

export const signInForAuthorization = async (
  _: AuthorizeLoginState,
  formData: FormData
): Promise<AuthorizeLoginState> => {
  const parse = loginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parse.success) {
    return { error: 'Enter a valid email and password' };
  }

  const { user, error } = await getDbUser({
    email: parse.data.email,
    password: parse.data.password,
  });

  if (error || !user) {
    return { error: error ?? 'Invalid email or password' };
  }

  const session = await getUserSession();
  session.user = {
    name: user.name,
    email: user.email,
    _id: user._id,
    shelves: user.shelves,
    columns: user.columns,
  };
  session.isLoggedId = true;
  await session.save();

  const result = await validatedConsentRequest(formData);
  if (!result.ok) {
    return { error: result.error };
  }

  redirect(authorizePagePath(result.request));
};

export const approveAuthorization = async (formData: FormData) => {
  const result = await validatedConsentRequest(formData);
  if (!result.ok) {
    throw new Error(result.error);
  }

  const session = await getUserSession();
  if (!session.user?._id) {
    redirect(authorizePagePath(result.request));
  }

  const code = await createAuthorizationCode({
    userId: String(session.user._id),
    clientId: result.request.clientId,
    redirectUri: result.request.redirectUri,
    codeChallenge: result.request.codeChallenge,
    resource: result.request.resource,
    scope: result.request.scope,
  });

  redirect(
    authorizeRedirect(result.request.redirectUri, {
      code,
      state: result.request.state,
    })
  );
};

export const denyAuthorization = async (formData: FormData) => {
  const result = await validatedConsentRequest(formData);
  if (!result.ok) {
    throw new Error(result.error);
  }

  redirect(
    authorizeRedirect(result.request.redirectUri, {
      error: 'access_denied',
      error_description: 'The user denied read access to the cellar',
      state: result.request.state,
    })
  );
};
