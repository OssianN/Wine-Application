import { getUserSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

type LandingPageProps = {
  children: ReactNode;
};

export default async function LandingPageLayout({
  children,
}: LandingPageProps) {
  const session = await getUserSession();
  if (session?.isLoggedId) redirect('/dashboard');

  return (
    <div className="flex flex-col justify-center items-center min-h-[100vh] min-w-[100vw] p-4 overflow-y-auto">
      {children}
    </div>
  );
}
