import type { ValidAuthorizeRequest } from '@/lib/oauth/authorize';

export const HiddenOAuthFields = ({
  request,
}: {
  request: ValidAuthorizeRequest;
}) => (
  <>
    <input type="hidden" name="response_type" value="code" />
    <input type="hidden" name="client_id" value={request.clientId} />
    <input type="hidden" name="redirect_uri" value={request.redirectUri} />
    <input type="hidden" name="code_challenge" value={request.codeChallenge} />
    <input type="hidden" name="code_challenge_method" value="S256" />
    <input type="hidden" name="resource" value={request.resource} />
    <input type="hidden" name="scope" value={request.scope} />
    {request.state ? (
      <input type="hidden" name="state" value={request.state} />
    ) : null}
  </>
);
