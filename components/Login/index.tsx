import { LoginForm } from './LoginForm';
import { CardComponent } from '../Card';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

type LoginProps = {
  returnTo?: string;
};

export const Login = ({ returnTo }: LoginProps) => {
  return (
    <CardComponent
      title="Log in"
      description="Your wines are waiting for you!"
      footer={
        <Link
          href="/register"
          className={buttonVariants({
            variant: 'link',
          })}
        >
          Register
        </Link>
      }
    >
      <LoginForm returnTo={returnTo} />
    </CardComponent>
  );
};
