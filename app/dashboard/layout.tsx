'use client';
import { Header } from '@/components/Header';
import { useState, type ReactNode } from 'react';

type HomePageLayoutProps = {
  children: ReactNode;
  wineGrid: ReactNode;
  wineTable: ReactNode;
  archivedWines: ReactNode;
  settingsPanel: ReactNode;
};

export type DashboardSubRoutes = 'grid' | 'table' | 'archived';

export default function DashboardLayout({
  wineGrid,
  wineTable,
  archivedWines,
  settingsPanel,
}: HomePageLayoutProps) {
  const [wineInterface, setWineinterface] =
    useState<DashboardSubRoutes>('grid');

  const subRoutesToTabSelectMap: Record<DashboardSubRoutes, ReactNode> = {
    grid: wineGrid,
    table: wineTable,
    archived: archivedWines,
  };

  return (
    <main className="p-4 pt-16 lg:p-12 lg:pt-16 max-w-[100vw]">
      <Header
        wineInterface={wineInterface}
        setWineinterface={setWineinterface}
      />
      {settingsPanel}
      {subRoutesToTabSelectMap[wineInterface]}
    </main>
  );
}
