import { RegisterForm } from './RegisterForm';
import { CardComponent } from '../Card';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

export const Register = () => {
  return (
    <CardComponent
      title="Register"
      description="Register a new account"
      footer={
        <Link
          href="/login"
          className={buttonVariants({
            variant: 'link',
          })}
        >
          Log in
        </Link>
      }
    >
      <RegisterForm />
    </CardComponent>
  );
};
