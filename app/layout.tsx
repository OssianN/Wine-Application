import { ThemeProvider } from '@/providers/ThemeProvider';
import { WineDetailsDialogProvider } from '@/providers/WineProvider';
import { SearchProvider } from '@/providers/SearchProvider';
import { Analytics } from '@vercel/analytics/react';
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
      <Analytics />
      <body className="no-scrollbar">
        <Toaster />
        <WineDetailsDialogProvider>
          <SearchProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </SearchProvider>
        </WineDetailsDialogProvider>
      </body>
    </html>
  );
}
