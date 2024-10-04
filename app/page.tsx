import Login from '@/components/Login';
import { getUserSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { isLoggedId } = await getUserSession();
  if (isLoggedId) redirect('/dashboard');

  return (
    <div className="flex flex-col justify-center items-center min-h-full min-w-full p-4">
      <h1 className="text-3xl text-center pb-8">
        This is the wine we wine about
      </h1>
      <Login />
    </div>
  );
}
