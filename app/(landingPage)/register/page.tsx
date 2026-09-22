import { Register } from '@/components/Register';
import { getUserSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const session = await getUserSession();
  if (session?.isLoggedId) {
    redirect('/dashboard');
  }

  return <Register />;
}
