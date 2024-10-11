'use client';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { AlignRight, X as Close } from 'lucide-react';
import { useState } from 'react';
import { ChangeStorageForm } from './ChangeStorageForm';
import { CardComponent } from '../Card';
import { logout } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { StorageData } from './StorageData';
import type { User } from '@/types';
import type { StorageDataType } from '@/lib/getStorageData';

type SettingsPanelProps = {
  user: Pick<User, 'columns' | 'shelves' | 'name'>;
  storageData: StorageDataType;
};

export const SettingsPanel = ({ user, storageData }: SettingsPanelProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        onClick={() => setOpen(true)}
        className="fixed top-6 right-4 lg:right-12 p-0 z-50"
      >
        <AlignRight />
      </DrawerTrigger>
      <DrawerContent
        className="px-4 w-full h-full md:max-h-[80%]"
        aria-describedby={undefined}
      >
        <DrawerHeader className="flex justify-center relative">
          <DrawerTitle className="text-3xl">{user.name}</DrawerTitle>

          <DrawerClose className="absolute top-2.5 right-2">
            <Close />
          </DrawerClose>

          <Button
            className="absolute top-1 left-2"
            variant="link"
            onClick={() => logout()}
          >
            Log out
          </Button>
        </DrawerHeader>

        <div className="flex flex-col items-center gap-4 pt-0 pb-8 px-4 max-w-full mx-auto overflow-x-hidden overflow-y-auto no-scrollbar">
          <ThemeSwitcher />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
            <CardComponent
              title="Storage information"
              description="Here's some information about your storage"
            >
              <StorageData {...storageData} />
            </CardComponent>

            <CardComponent
              title="Change wine storage"
              description="Update the size of your storage"
            >
              <ChangeStorageForm user={user} onOpenSettingsChange={setOpen} />
            </CardComponent>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
