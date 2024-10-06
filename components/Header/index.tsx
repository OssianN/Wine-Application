import { Search } from '@/components/Search';
import { WineInterfaceNav } from '@/components/WineInterfaceNav';
import type { DashboardSubRoutes } from '@/app/dashboard/layout';
import type { Dispatch, SetStateAction } from 'react';

type HeaderProps = {
  wineInterface: DashboardSubRoutes;
  setWineinterface: Dispatch<SetStateAction<DashboardSubRoutes>>;
};

export const Header = ({ wineInterface, setWineinterface }: HeaderProps) => {
  return (
    <div className="flex justify-between items-center gap-2 w-full fixed top-0 pr-8 py-4 bg-background z-50">
      <Search />
      <WineInterfaceNav
        value={wineInterface}
        onValueChange={setWineinterface}
      />
    </div>
  );
};
