import { getUserSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

type LandingPageProps = {
  children: ReactNode;
};

export default async function LandingPageLayout({
  children,
}: LandingPageProps) {
  const { isLoggedId } = await getUserSession();
  if (isLoggedId) redirect('/dashboard');

  return (
    <div className="flex flex-col justify-center items-center min-h-[100vh] min-w-[100vw] p-4 overflow-y-auto">
      <h1 className="text-3xl text-center pb-8">
        This is the wine we wine about
      </h1>
      {children}
    </div>
  );
}
