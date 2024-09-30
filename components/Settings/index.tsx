import React from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '../ui/drawer';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { X as Close } from 'lucide-react';

type SettingsPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const SettingsPanel = ({ open, onOpenChange }: SettingsPanelProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="px-4 h-full md:h-1/2"
        aria-describedby={undefined}
      >
        <DrawerHeader className="flex justify-between items-center">
          <ThemeSwitcher />
          <DrawerTitle className="self-center">Settings</DrawerTitle>
          <DrawerClose>
            <Close />
          </DrawerClose>
        </DrawerHeader>
        <div className="px-4"></div>
      </DrawerContent>
    </Drawer>
  );
};
