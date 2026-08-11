'use client';

import { ThemeProvider } from '@/components/custom/theme-provider';
import { ConfirmProvider } from '@/components/custom/confirm-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ConfirmProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </ConfirmProvider>
    </ThemeProvider>
  );
}
