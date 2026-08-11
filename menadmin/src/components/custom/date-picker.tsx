'use client';

import { format } from 'date-fns';
import { mn } from 'date-fns/locale/mn';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type DatePickerProps = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function DatePicker({
  value,
  onChange,
  placeholder = 'Огноо сонгох',
  disabled,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
              className
            )}
          >
            <CalendarIcon className="size-4" />
            {value ? format(value, 'yyyy-MM-dd', { locale: mn }) : placeholder}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} locale={mn} />
      </PopoverContent>
    </Popover>
  );
}

export function formatDate(value: string | Date, withTime = false) {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, withTime ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd', { locale: mn });
}
