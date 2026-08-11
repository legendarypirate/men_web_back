import './globals.css';
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AppProviders } from '@/components/custom/app-providers';

const nunito = Nunito({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VitalMen Admin',
  description: 'VitalMen удирдлагын самбар',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" suppressHydrationWarning className={cn(nunito.variable)}>
      <body className={cn('min-h-screen antialiased font-sans', nunito.className)}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
