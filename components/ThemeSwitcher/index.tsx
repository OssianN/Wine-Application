'use client';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from 'lucide-react';

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1">
      <SunIcon size={16} />
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
      />
      <MoonIcon size={16} />
    </div>
  );
};
