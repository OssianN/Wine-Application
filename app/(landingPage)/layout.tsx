import type { ReactNode } from 'react';

type LandingPageProps = {
  children: ReactNode;
};

export default function LandingPageLayout({ children }: LandingPageProps) {
  return (
    <div className="flex flex-col justify-center items-center min-h-[100vh] min-w-[100vw] p-4 overflow-y-auto">
      {children}
    </div>
  );
}
