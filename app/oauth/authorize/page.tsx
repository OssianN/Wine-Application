import { CardComponent } from '@/components/Card';
import { validateAuthorizeQuery } from '@/lib/oauth/authorize';
import { clientAllowsRedirect, loadOAuthClient } from '@/lib/oauth/clients';
import { resolveResourceUrlFromHeaders } from '@/lib/oauth/urls';
import { getUserSession } from '@/lib/session';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { AuthorizeLoginForm } from './AuthorizeLoginForm';
import { ConsentForm } from './ConsentForm';

type AuthorizePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function AuthorizePage({
  searchParams,
}: AuthorizePageProps) {
  const query = await searchParams;
  const resourceUrl = resolveResourceUrlFromHeaders(await headers());
  const validation = validateAuthorizeQuery(
    {
      response_type: first(query.response_type),
      client_id: first(query.client_id),
      redirect_uri: first(query.redirect_uri),
      code_challenge: first(query.code_challenge),
      code_challenge_method: first(query.code_challenge_method),
      state: first(query.state),
      resource: first(query.resource),
      scope: first(query.scope),
    },
    resourceUrl
  );

  if (!validation.ok) {
    return (
      <AuthorizeShell>
        <CardComponent
          title="Cannot connect"
          description={validation.description}
        >
          <p className="text-sm text-muted-foreground">
            The chat sent an invalid authorization request.
          </p>
        </CardComponent>
      </AuthorizeShell>
    );
  }

  const client = await loadOAuthClient(validation.request.clientId);
  if (!client || !clientAllowsRedirect(client, validation.request.redirectUri)) {
    return (
      <AuthorizeShell>
        <CardComponent
          title="Cannot connect"
          description="This chat is not a recognized OAuth client."
        >
          <p className="text-sm text-muted-foreground">
            Register the client first, or use a Client ID Metadata Document URL.
          </p>
        </CardComponent>
      </AuthorizeShell>
    );
  }

  const session = await getUserSession();
  if (!session?.isLoggedId || !session.user) {
    return (
      <AuthorizeShell>
        <AuthorizeLoginForm request={validation.request} />
      </AuthorizeShell>
    );
  }

  return (
    <AuthorizeShell>
      <ConsentForm request={validation.request} />
    </AuthorizeShell>
  );
}

const AuthorizeShell = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col justify-center items-center min-h-[100vh] min-w-[100vw] p-4 overflow-y-auto">
    {children}
  </div>
);
