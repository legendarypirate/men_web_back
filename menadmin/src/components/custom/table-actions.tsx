'use client';

import { SquarePen, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type TableIconButtonProps = {
  variant: 'edit' | 'delete';
  onClick: () => void;
  disabled?: boolean;
  label?: string;
};

export function TableIconButton({
  variant,
  onClick,
  disabled,
  label,
}: TableIconButtonProps) {
  const isEdit = variant === 'edit';
  const text = label || (isEdit ? 'Засах' : 'Устгах');

  return (
    <Tooltip>
      <TooltipTrigger
        disabled={disabled}
        onClick={onClick}
        render={
          <button
            type="button"
            className={cn(
              'inline-flex size-7 shrink-0 items-center justify-center rounded-[5px] border p-0 transition-colors disabled:pointer-events-none disabled:opacity-50',
              isEdit
                ? 'border-[#dfe4ea] bg-[#f4f6f8] text-[#5d6d7e] hover:bg-[#eef1f4]'
                : 'border-[#fadbd8] bg-[#fdedec] text-[#e74c3c] hover:bg-[#fadbd8]'
            )}
            aria-label={text}
          />
        }
      >
        {isEdit ? (
          <SquarePen className="size-3.5" strokeWidth={2} />
        ) : (
          <Trash2 className="size-3.5" strokeWidth={2} />
        )}
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}

type TableRowActionsProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export function TableRowActions({ onEdit, onDelete, disabled }: TableRowActionsProps) {
  if (!onEdit && !onDelete) return null;

  return (
    <div className="flex items-center gap-1.5">
      {onEdit && (
        <TableIconButton variant="edit" onClick={onEdit} disabled={disabled} />
      )}
      {onDelete && (
        <TableIconButton variant="delete" onClick={onDelete} disabled={disabled} />
      )}
    </div>
  );
}
