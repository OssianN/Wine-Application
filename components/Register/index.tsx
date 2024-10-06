import { RegisterForm } from './RegisterForm';
import { CardComponent } from '../Card';

export const Register = () => {
  return (
    <CardComponent title="Register" description="Register a new account">
      <RegisterForm />
    </CardComponent>
  );
};
