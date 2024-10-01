import { Search } from '@/components/Search';
import { Button } from '@/components/ui/button';
import { WineInterfaceNav } from '@/components/WineInterfaceNav';
import { Settings } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

type HeaderProps = {
  setOpenSettings: Dispatch<SetStateAction<boolean>>;
  wineInterface: string;
  setWineinterface: Dispatch<SetStateAction<string>>;
};

export const Header = ({
  setOpenSettings,
  wineInterface,
  setWineinterface,
}: HeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <Search />
      <WineInterfaceNav
        value={wineInterface}
        onValueChange={setWineinterface}
      />
      <Button variant="ghost" onClick={() => setOpenSettings(true)}>
        <Settings />
      </Button>
    </div>
  );
};
