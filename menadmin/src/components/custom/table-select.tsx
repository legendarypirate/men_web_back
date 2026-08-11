'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const tableSelectTriggerClass =
  'h-6! min-h-0! w-[120px] rounded border-[#dfe4ea] bg-white py-0! pr-1.5 pl-2 text-xs font-medium leading-none text-[#2c3e50] shadow-none [&_svg]:size-3';

type TableSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
};

export function TableSelect({
  value,
  onValueChange,
  options,
  className,
}: TableSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => v && onValueChange(v)}>
      <SelectTrigger className={cn(tableSelectTriggerClass, className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
