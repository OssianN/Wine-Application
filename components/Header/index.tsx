import { Search } from '@/components/Search';
import { Button } from '@/components/ui/button';
import type { Dispatch, SetStateAction } from 'react';

type HeaderProps = {
  setOpenSettings: Dispatch<SetStateAction<boolean>>;
};

export const Header = ({ setOpenSettings }: HeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <Search />
      <Button onClick={() => setOpenSettings(true)}>Settings</Button>
    </div>
  );
};
