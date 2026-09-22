import { Login } from '@/components/Login';
import { isSafeOauthReturnTo } from '@/lib/oauth/returnTo';
import { getUserSession } from '@/lib/session';
import { redirect } from 'next/navigation';

type LoginPageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { returnTo } = await searchParams;
  const safeReturnTo = isSafeOauthReturnTo(returnTo) ? returnTo : undefined;
  const session = await getUserSession();

  if (session?.isLoggedId) {
    redirect(safeReturnTo ?? '/dashboard');
  }

  return <Login returnTo={safeReturnTo} />;
}
