import { CardComponent } from '@/components/Card';
import { Button } from '@/components/ui/button';
import type { ValidAuthorizeRequest } from '@/lib/oauth/authorize';
import { approveAuthorization, denyAuthorization } from './actions';
import { HiddenOAuthFields } from './HiddenOAuthFields';

type ConsentFormProps = {
  request: ValidAuthorizeRequest;
};

export const ConsentForm = ({ request }: ConsentFormProps) => {
  return (
    <CardComponent
      title="Allow cellar access"
      description="This chat can read your wine list. It cannot add, move, or delete bottles."
    >
      <div className="flex flex-col gap-3">
        <form action={approveAuthorization} className="flex flex-col gap-3">
          <HiddenOAuthFields request={request} />
          <Button type="submit">Allow read access to my cellar</Button>
        </form>
        <form action={denyAuthorization}>
          <HiddenOAuthFields request={request} />
          <Button type="submit" variant="outline" className="w-full">
            Deny
          </Button>
        </form>
      </div>
    </CardComponent>
  );
};
