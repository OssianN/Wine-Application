import { getUserSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getUserSession();
  if (session?.isLoggedId) redirect('/dashboard');

  redirect('/login');
}
