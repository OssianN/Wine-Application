import { CardComponent } from '@/components/Card';
import { Button } from '@/components/ui/button';
import type { ValidAuthorizeRequest } from '@/lib/oauth/authorize';
import { approveAuthorization, denyAuthorization } from './actions';

type ConsentFormProps = {
  request: ValidAuthorizeRequest;
};

const HiddenFields = ({ request }: ConsentFormProps) => (
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

export const ConsentForm = ({ request }: ConsentFormProps) => {
  return (
    <CardComponent
      title="Allow cellar access"
      description="This chat can read your wine list. It cannot add, move, or delete bottles."
    >
      <div className="flex flex-col gap-3">
        <form action={approveAuthorization} className="flex flex-col gap-3">
          <HiddenFields request={request} />
          <Button type="submit">Allow read access to my cellar</Button>
        </form>
        <form action={denyAuthorization}>
          <HiddenFields request={request} />
          <Button type="submit" variant="outline" className="w-full">
            Deny
          </Button>
        </form>
      </div>
    </CardComponent>
  );
};
