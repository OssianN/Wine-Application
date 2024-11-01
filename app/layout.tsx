import { ThemeProvider } from '@/providers/ThemeProvider';
import { WineDetailsDialogProvider } from '@/providers/WineProvider';
import { SearchProvider } from '@/providers/SearchProvider';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from '@/components/ui/toaster';
import { Special_Elite } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'My Wine Shelf',
  description:
    'Keep track of your wines, look up information about them and find them in your shelf.',
};

const electrolizeFont = Special_Elite({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-electrolize',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={electrolizeFont.variable}
    >
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0 virtual-keyboard=overlays-content"
      />
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
