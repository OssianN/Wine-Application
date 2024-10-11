'use client';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from 'lucide-react';

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-16 relative">
      <SunIcon
        className="absolute left-2 top-2 pointer-events-none text-neutral-700 z-10"
        size={16}
      />
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
      />
      <MoonIcon
        className="absolute right-2 top-2 pointer-events-none"
        size={16}
      />
    </div>
  );
};
