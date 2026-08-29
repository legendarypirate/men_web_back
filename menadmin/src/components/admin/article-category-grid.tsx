'use client';

import { useState } from 'react';
import { ChevronRight, GripVertical, Newspaper, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type ArticleCategoryItem = {
  id: string;
  name: string;
  count: number;
  sortOrder: number;
};

type ArticleCategoryGridProps = {
  categories: ArticleCategoryItem[];
  reordering?: boolean;
  onOpen: (name: string) => void;
  onDelete: (category: ArticleCategoryItem) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
};

export function ArticleCategoryGrid({
  categories,
  reordering = false,
  onOpen,
  onDelete,
  onReorder,
}: ArticleCategoryGridProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(event: React.DragEvent, index: number) {
    event.preventDefault();
    if (dragIndex == null || dragIndex === index) return;
    setOverIndex(index);
  }

  function handleDrop(index: number) {
    if (dragIndex == null || dragIndex === index) return;
    onReorder(dragIndex, index);
    setDragIndex(null);
    setOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {categories.map((category, index) => {
        const isDragging = dragIndex === index;
        const isOver = overIndex === index && dragIndex != null && dragIndex !== index;

        return (
          <div
            key={category.name}
            className={cn(
              'relative transition-transform',
              isDragging && 'opacity-50',
              isOver && 'scale-[1.02]'
            )}
            onDragOver={(event) => handleDragOver(event, index)}
            onDrop={() => handleDrop(index)}
          >
            <Card
              className={cn(
                'h-full border-border/80 shadow-sm transition-colors',
                isOver && 'border-primary ring-2 ring-primary/20',
                !reordering && 'hover:border-primary/40 hover:bg-muted/20'
              )}
            >
              <CardContent className="flex items-center gap-3 p-5">
                <button
                  type="button"
                  draggable={!reordering}
                  disabled={reordering}
                  aria-label={`${category.name} зөөх`}
                  className={cn(
                    'flex size-9 shrink-0 cursor-grab items-center justify-center rounded-lg border border-border/70 bg-muted/40 text-muted-foreground transition-colors',
                    'hover:bg-muted hover:text-foreground active:cursor-grabbing',
                    reordering && 'cursor-not-allowed opacity-50'
                  )}
                  onDragStart={() => handleDragStart(index)}
                  onDragEnd={handleDragEnd}
                >
                  <GripVertical className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpen(category.name)}
                  className="flex min-w-0 flex-1 items-center gap-4 text-left"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Newspaper className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{category.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {category.count} нийтлэл
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 size-8 text-muted-foreground hover:text-destructive"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(category);
              }}
              aria-label={`${category.name} устгах`}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
