import { getUserSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { isLoggedId } = await getUserSession();
  if (isLoggedId) redirect('/dashboard');

  redirect('/login');
}
