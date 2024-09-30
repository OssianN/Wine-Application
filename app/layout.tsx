import { ThemeProvider } from '@/providers/ThemeProvider';
import { WineDetailsDialogProvider } from '@/providers/WineDetailsDialogProvider';
import { SearchProvider } from '@/providers/SearchProvider';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wine Shelf',
  description:
    'Keep track of your wines, look up information about them and find them in your shelf.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <WineDetailsDialogProvider>
          <SearchProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </SearchProvider>
        </WineDetailsDialogProvider>
      </body>
    </html>
  );
}
