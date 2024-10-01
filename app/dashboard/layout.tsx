'use client';
import { Header } from '@/components/Header';
import { SettingsPanel } from '@/components/Settings';
import { useState } from 'react';

type HomePageLayoutProps = {
  children: React.ReactNode;
  wineGrid: React.ReactNode;
  wineTable: React.ReactNode;
};

export default function HomPageLayout({
  wineGrid,
  wineTable,
}: HomePageLayoutProps) {
  const [openSettings, setOpenSettings] = useState(false);
  const [wineInterface, setWineinterface] = useState('grid');

  return (
    <main className="p-4 lg:p-12">
      <Header
        setOpenSettings={setOpenSettings}
        wineInterface={wineInterface}
        setWineinterface={setWineinterface}
      />
      {wineInterface === 'grid' ? wineGrid : wineTable}
      <SettingsPanel onOpenChange={setOpenSettings} open={openSettings} />
    </main>
  );
}
