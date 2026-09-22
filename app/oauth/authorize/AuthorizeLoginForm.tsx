'use client';

import { CardComponent } from '@/components/Card';
import { SubmitButton } from '@/components/SubmitButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ValidAuthorizeRequest } from '@/lib/oauth/authorize';
import { useActionState } from 'react';
import { HiddenOAuthFields } from './HiddenOAuthFields';
import { signInForAuthorization, type AuthorizeLoginState } from './actions';

type AuthorizeLoginFormProps = {
  request: ValidAuthorizeRequest;
};

const initialState: AuthorizeLoginState = {};

export const AuthorizeLoginForm = ({ request }: AuthorizeLoginFormProps) => {
  const [state, formAction] = useActionState(
    signInForAuthorization,
    initialState
  );

  return (
    <CardComponent
      title="Log in to connect"
      description="Sign in so this chat can read your wine list."
    >
      <form action={formAction} className="flex flex-col gap-4">
        <HiddenOAuthFields request={request} />
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <SubmitButton buttonText="Log in" />
      </form>
    </CardComponent>
  );
};
