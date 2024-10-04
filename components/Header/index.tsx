import { Search } from '@/components/Search';
import { Button } from '@/components/ui/button';
import { WineInterfaceNav } from '@/components/WineInterfaceNav';
import { Settings } from 'lucide-react';
import type { DashboardSubRoutes } from '@/app/dashboard/layout';
import type { Dispatch, SetStateAction } from 'react';

type HeaderProps = {
  setOpenSettings: Dispatch<SetStateAction<boolean>>;
  wineInterface: DashboardSubRoutes;
  setWineinterface: Dispatch<SetStateAction<DashboardSubRoutes>>;
};

export const Header = ({
  setOpenSettings,
  wineInterface,
  setWineinterface,
}: HeaderProps) => {
  return (
    <div className="flex justify-between items-center gap-2 sticky top-0 py-2 bg-background z-50">
      <Search />
      <WineInterfaceNav
        value={wineInterface}
        onValueChange={setWineinterface}
      />
      <Button
        className="p-0"
        variant="link"
        onClick={() => setOpenSettings(true)}
      >
        <Settings />
      </Button>
    </div>
  );
};
