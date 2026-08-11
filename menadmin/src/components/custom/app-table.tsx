'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { ColumnDef } from '@/lib/types/fields';
import { TableRowActions } from '@/components/custom/table-actions';
import { TablePagination } from '@/components/custom/table-pagination';
import { cn } from '@/lib/utils';

type SortDir = 'asc' | 'desc';

type AppTableProps<T> = {
  columns: ColumnDef<T>[];
  rows: T[];
  idKey: keyof T;
  actions?: (row: T) => React.ReactNode;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  canDelete?: (row: T) => boolean;
  emptyMessage?: string;
  loading?: boolean;
  showIndex?: boolean;
  sortable?: boolean;
  actionLabel?: string;
  actionColumnClassName?: string;
  actionPosition?: 'start' | 'end';
  pagination?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
};

const ROW_H = 'h-10';
const thBase =
  'max-h-10 bg-[#f8f9fa] px-4 py-0 text-[11px] font-bold leading-none tracking-[0.06em] text-[#95a5a6] uppercase whitespace-nowrap align-middle';
const tdBase = 'max-h-10 px-4 py-0 text-[13px] leading-none text-[#2c3e50] align-middle';

function alignClass(align?: ColumnDef<unknown>['align']) {
  if (align === 'center') return 'text-center';
  if (align === 'right') return 'text-right';
  return 'text-left';
}

function Cell({
  children,
  align,
  className,
}: {
  children: React.ReactNode;
  align?: ColumnDef<unknown>['align'];
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-10 max-h-10 items-center overflow-hidden',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end',
        className
      )}
    >
      {children}
    </div>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return <ChevronsUpDown className="size-3.5 text-[#bdc3c7]" strokeWidth={2} />;
  }
  return dir === 'asc' ? (
    <ArrowUp className="size-3.5 text-[#1abc9c]" strokeWidth={2.5} />
  ) : (
    <ArrowDown className="size-3.5 text-[#1abc9c]" strokeWidth={2.5} />
  );
}

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#e8ecef] border-t-[3px] border-t-[#1abc9c] bg-white shadow-sm">
      {children}
    </div>
  );
}

export function AppTable<T extends Record<string, unknown>>({
  columns,
  rows,
  idKey,
  actions,
  onEdit,
  onDelete,
  canDelete,
  emptyMessage = 'Мэдээлэл байхгүй',
  loading,
  showIndex = true,
  sortable = true,
  actionLabel = 'Үйлдэл',
  actionColumnClassName,
  actionPosition = 'end',
  pagination = true,
  defaultPageSize = 30,
  pageSizeOptions = [10, 20, 30, 50],
}: AppTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const hasRowActions = Boolean(onEdit || onDelete || actions);

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey as keyof T];
      const bv = b[sortKey as keyof T];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const as = String(av).toLowerCase();
      const bs = String(bv).toLowerCase();
      if (as < bs) return sortDir === 'asc' ? -1 : 1;
      if (as > bs) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedRows = useMemo(() => {
    if (!pagination) return sortedRows;
    const start = (page - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, pagination, page, pageSize]);

  function toggleSort(col: ColumnDef<T>) {
    const key = String(col.key);
    const colSortable = col.sortable ?? sortable;
    if (!colSortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function renderActions(row: T) {
    if (actions) return actions(row);
    const showDelete = onDelete && (canDelete?.(row) ?? true);
    if (!onEdit && !showDelete) return null;
    return (
      <TableRowActions
        onEdit={onEdit ? () => onEdit(row) : undefined}
        onDelete={showDelete ? () => onDelete!(row) : undefined}
      />
    );
  }

  function renderActionHeader() {
    if (!hasRowActions) return null;
    return (
      <th className={cn(thBase, ROW_H, 'w-[88px] text-center', actionColumnClassName)}>
        {actionLabel}
      </th>
    );
  }

  function renderActionCell(row: T) {
    if (!hasRowActions) return null;
    return (
      <td className={cn(tdBase, ROW_H, 'text-center', actionColumnClassName)}>
        <Cell align="center">{renderActions(row)}</Cell>
      </td>
    );
  }

  if (loading) {
    return (
      <TableShell>
        <div className="p-12 text-center text-sm text-[#95a5a6]">Ачааллаж байна...</div>
      </TableShell>
    );
  }

  if (rows.length === 0) {
    return (
      <TableShell>
        <div className="p-12 text-center text-sm text-[#95a5a6]">{emptyMessage}</div>
      </TableShell>
    );
  }

  return (
    <TableShell>
      <div className="overflow-x-auto">
        <table className={cn('w-full border-collapse', ROW_H, '[&_tbody_tr]:max-h-10')}>
          <thead>
            <tr className={cn(ROW_H, 'border-b border-[#e8ecef]')}>
              {showIndex && (
                <th className={cn(thBase, ROW_H, 'w-14 text-center')}>№</th>
              )}
              {actionPosition === 'start' && renderActionHeader()}
              {columns.map((col) => {
                const key = String(col.key);
                const active = sortKey === key;
                const colSortable = (col.sortable ?? sortable) && sortable;
                return (
                  <th
                    key={key}
                    className={cn(
                      thBase,
                      ROW_H,
                      alignClass(col.align),
                      colSortable && 'cursor-pointer select-none hover:text-[#7f8c8d]',
                      col.className
                    )}
                    onClick={() => toggleSort(col)}
                  >
                    <span
                      className={cn(
                        'inline-flex h-10 items-center gap-1.5',
                        col.align === 'center' && 'justify-center',
                        col.align === 'right' && 'justify-end'
                      )}
                    >
                      {col.label}
                      {colSortable && <SortIcon active={active} dir={sortDir} />}
                    </span>
                  </th>
                );
              })}
              {actionPosition === 'end' && renderActionHeader()}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, index) => {
              const rowNumber = pagination
                ? (page - 1) * pageSize + index + 1
                : index + 1;

              return (
                <tr
                  key={String(row[idKey])}
                  className={cn(
                    ROW_H,
                    'border-b border-[#eef1f4] last:border-0 hover:bg-[#fafbfc]'
                  )}
                >
                  {showIndex && (
                    <td className={cn(tdBase, ROW_H, 'text-center text-[#95a5a6]')}>
                      <Cell align="center">{rowNumber}</Cell>
                    </td>
                  )}
                  {actionPosition === 'start' && renderActionCell(row)}
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn(tdBase, ROW_H, alignClass(col.align), col.className)}
                    >
                      <Cell align={col.align}>
                        {col.render
                          ? col.render(row)
                          : String(row[col.key as keyof T] ?? '—')}
                      </Cell>
                    </td>
                  ))}
                  {actionPosition === 'end' && renderActionCell(row)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && sortedRows.length > 0 && (
        <TablePagination
          total={sortedRows.length}
          page={page}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}
    </TableShell>
  );
}
