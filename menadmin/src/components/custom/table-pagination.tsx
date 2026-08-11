'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type TablePaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
};

export function TablePagination({
  total,
  page,
  pageSize,
  pageSizeOptions = [10, 20, 30, 50],
  onPageChange,
  onPageSizeChange,
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-[#e8ecef] px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <p className="text-[13px] text-[#7f8c8d]">
        Нийт{' '}
        <span className="font-semibold text-[#2c3e50]">{total}</span> бүртгэл, Хуудас{' '}
        <span className="font-semibold text-[#2c3e50]">{safePage}</span> / Нийт{' '}
        <span className="font-semibold text-[#2c3e50]">{totalPages}</span> хуудас
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(v) => v && onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8! min-h-0! w-[72px] rounded border-[#dfe4ea] bg-white py-0! text-[13px] shadow-none [&_svg]:size-3.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            className="inline-flex h-8 items-center gap-0.5 rounded px-2 text-[13px] text-[#5d6d7e] transition-colors hover:text-[#2c3e50] disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
            Өмнөх
          </button>

          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded border border-[#dfe4ea] bg-white px-2 text-[13px] font-semibold text-[#2c3e50]">
            {safePage}
          </span>

          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
            className="inline-flex h-8 items-center gap-0.5 rounded px-2 text-[13px] text-[#5d6d7e] transition-colors hover:text-[#2c3e50] disabled:pointer-events-none disabled:opacity-40"
          >
            Дараах
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
