'use client';
import { Header } from '@/components/Header';
import { SettingsPanel } from '@/components/Settings';
import { useState } from 'react';

type HomePageLayoutProps = {
  children: React.ReactNode;
};

export default function HomPageLayout({ children }: HomePageLayoutProps) {
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <main className="p-4 lg:p-12">
      <Header setOpenSettings={setOpenSettings} />
      {children}
      <SettingsPanel onOpenChange={setOpenSettings} open={openSettings} />
    </main>
  );
}
