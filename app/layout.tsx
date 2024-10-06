import { ThemeProvider } from '@/providers/ThemeProvider';
import { WineDetailsDialogProvider } from '@/providers/WineProvider';
import { SearchProvider } from '@/providers/SearchProvider';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'My Wine Shelf',
  description:
    'Keep track of your wines, look up information about them and find them in your shelf.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-w-[100vw] min-h-[100vh]">
        <WineDetailsDialogProvider>
          <SearchProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </SearchProvider>
          <Toaster />
        </WineDetailsDialogProvider>
      </body>
    </html>
  );
}
