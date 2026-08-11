'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AddButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

export function AddButton({ label, onClick, disabled, className }: AddButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-9 gap-1.5 rounded-lg px-4 font-semibold shadow-sm',
        className
      )}
    >
      <Plus className="size-4" strokeWidth={2.5} />
      {label}
    </Button>
  );
}
