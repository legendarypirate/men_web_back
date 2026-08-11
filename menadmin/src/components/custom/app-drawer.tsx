'use client';

import { ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export type AppDrawerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type AppDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: AppDrawerSize;
};

const sizeClass: Record<AppDrawerSize, string> = {
  sm: 'sm:!max-w-4xl',
  md: 'sm:!max-w-5xl',
  lg: 'sm:!max-w-6xl',
  xl: 'sm:!max-w-7xl',
  '2xl': 'sm:!max-w-[96rem]',
};

export function AppDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'lg',
}: AppDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          'flex h-full w-full max-w-[95vw] flex-col gap-0 p-0',
          sizeClass[size]
        )}
      >
        <SheetHeader className="shrink-0 border-b px-6 py-5 text-left">
          <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
          {description && (
            <SheetDescription className="text-sm">{description}</SheetDescription>
          )}
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <SheetFooter className="shrink-0 flex-row justify-end gap-2 border-t bg-background px-6 py-4">
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
