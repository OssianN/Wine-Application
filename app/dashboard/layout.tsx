'use client';
import { Header } from '@/components/Header';
import { SettingsPanel } from '@/components/Settings';
import { useState, type ReactNode } from 'react';

type HomePageLayoutProps = {
  children: ReactNode;
  wineGrid: ReactNode;
  wineTable: ReactNode;
  archivedWines: ReactNode;
};

export type DashboardSubRoutes = 'grid' | 'table' | 'archived';

export default function HomPageLayout({
  wineGrid,
  wineTable,
  archivedWines,
}: HomePageLayoutProps) {
  const [openSettings, setOpenSettings] = useState(false);
  const [wineInterface, setWineinterface] =
    useState<DashboardSubRoutes>('grid');

  const subRoutesToTabSelectMap: Record<DashboardSubRoutes, ReactNode> = {
    grid: wineGrid,
    table: wineTable,
    archived: archivedWines,
  };

  return (
    <main className="p-4 lg:p-12 max-w-[100vw]">
      <Header
        setOpenSettings={setOpenSettings}
        wineInterface={wineInterface}
        setWineinterface={setWineinterface}
      />
      {subRoutesToTabSelectMap[wineInterface]}
      <SettingsPanel onOpenChange={setOpenSettings} open={openSettings} />
    </main>
  );
}
