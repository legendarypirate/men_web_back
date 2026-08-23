'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, Product } from '@/lib/api';
import { formatMnt } from '@/lib/api';
import { ProductImagesEditor } from '@/components/admin/product-images-editor';
import { ProductDetailSectionsEditor } from '@/components/admin/product-detail-sections-editor';
import { StringListEditor } from '@/components/admin/string-list-editor';
import { AppDrawer } from '@/components/custom/app-drawer';
import { AppTable } from '@/components/custom/app-table';
import { useConfirm } from '@/components/custom/confirm-provider';
import { AddButton } from '@/components/custom/add-button';
import { ErrorState, LoadingState, PageHeader } from '@/components/page-ui';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categoryOptions = [
  { label: 'Витамин', value: 'supplements' },
  { label: 'Тоног төхөөрөмж', value: 'devices' },
  { label: 'Сэргээлт', value: 'wellness' },
  { label: 'Хоол тэжээл', value: 'nutrition' },
];

export default function ProductsPage() {
  const confirm = useConfirm();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const empty: Product = {
    id: '',
    name: '',
    description: '',
    priceMnt: 0,
    category: 'supplements',
    icon: 'shopping_bag',
    gradientStart: '#0F766E',
    gradientEnd: '#14B8A6',
    images: [],
    benefits: [],
    detailSections: [],
    rating: 4.5,
    reviewCount: 0,
    inStock: true,
    featured: false,
    sortOrder: 0,
    active: true,
  };

  async function load() {
    setLoading(true);
    try {
      const res = await api.products.list();
      setProducts(res.data.products);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        ...editing,
        images: editing.images || [],
        benefits: editing.benefits || [],
        detailSections: editing.detailSections || [],
      };
      if (editing.id && products.some((p) => p.id === editing.id)) {
        await api.products.update(editing.id, payload);
      } else {
        await api.products.create(payload);
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Хадгалахад алдаа');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: 'Бүтээгдэхүүн устгах уу?',
      description: 'Энэ үйлдлийг буцаах боломжгүй.',
      confirmLabel: 'Устгах',
      destructive: true,
    });
    if (!ok) return;
    await api.products.remove(id);
    load();
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Дэлгүүрийн бүтээгдэхүүн"
        subtitle={`${products.length} бүтээгдэхүүн`}
        action={
          <AddButton
            label="Бүтээгдэхүүн нэмэх"
            onClick={() => {
              setEditing({
                ...empty,
                id: `product_${Date.now()}`,
              });
              setShowForm(true);
            }}
          />
        }
      />
      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      <AppTable
        columns={[
          {
            key: 'thumb',
            label: '',
            sortable: false,
            className: 'w-12',
            render: (p) =>
              p.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.images[0]}
                  alt=""
                  className="h-10 w-10 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                  —
                </div>
              ),
          },
          { key: 'name', label: 'Бүтээгдэхүүн', className: 'font-semibold text-[#2c3e50]' },
          {
            key: 'category',
            label: 'Ангилал',
            render: (p) =>
              categoryOptions.find((c) => c.value === p.category)?.label || p.category,
          },
          {
            key: 'priceMnt',
            label: 'Үнэ',
            align: 'center',
            render: (p) => formatMnt(p.priceMnt),
          },
          {
            key: 'images',
            label: 'Зураг',
            align: 'center',
            sortable: false,
            render: (p) => p.images?.length || 0,
          },
          {
            key: 'featured',
            label: 'Онцлох',
            align: 'center',
            render: (p) => (p.featured ? '✓' : '—'),
          },
          {
            key: 'inStock',
            label: 'Нөөц',
            align: 'center',
            render: (p) => (p.inStock ? '✓' : '—'),
          },
        ]}
        rows={products}
        idKey="id"
        onEdit={(p) => {
          setEditing({
            ...p,
            images: p.images?.length ? [...p.images] : [],
            benefits: p.benefits?.length ? [...p.benefits] : [],
            detailSections: p.detailSections?.length ? [...p.detailSections] : [],
          });
          setShowForm(true);
        }}
        onDelete={(p) => handleDelete(p.id)}
      />

      <AppDrawer
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditing(null);
        }}
        title="Бүтээгдэхүүн засах"
        size="xl"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Болих
            </Button>
            <Button type="submit" form="product-form" disabled={saving}>
              {saving ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>ID</Label>
              <Input
                value={editing?.id || ''}
                onChange={(e) => editing && setEditing({ ...editing, id: e.target.value })}
                required
                disabled={products.some((p) => p.id === editing?.id)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ангилал</Label>
              <Select
                value={editing?.category || 'supplements'}
                onValueChange={(v) =>
                  editing &&
                  setEditing({ ...editing, category: v as Product['category'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Нэр</Label>
            <Input
              value={editing?.name || ''}
              onChange={(e) => editing && setEditing({ ...editing, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Тайлбар</Label>
            <Textarea
              value={editing?.description || ''}
              onChange={(e) =>
                editing && setEditing({ ...editing, description: e.target.value })
              }
              required
              rows={3}
            />
          </div>

          <ProductImagesEditor
            images={editing?.images || []}
            onChange={(images) => editing && setEditing({ ...editing, images })}
            onUploadImage={async (file) => {
              const result = await api.upload.image(file);
              return result.url;
            }}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Үнэ (₮)</Label>
              <Input
                type="number"
                value={editing?.priceMnt || 0}
                onChange={(e) =>
                  editing && setEditing({ ...editing, priceMnt: Number(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <Input
                type="number"
                step="0.1"
                value={editing?.rating || 4.5}
                onChange={(e) =>
                  editing && setEditing({ ...editing, rating: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Эрэмбэ</Label>
              <Input
                type="number"
                value={editing?.sortOrder || 0}
                onChange={(e) =>
                  editing && setEditing({ ...editing, sortOrder: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Icon</Label>
              <Input
                value={editing?.icon || ''}
                onChange={(e) => editing && setEditing({ ...editing, icon: e.target.value })}
                placeholder="fitness_center"
              />
            </div>
            <div className="space-y-2">
              <Label>Gradient эхлэл</Label>
              <Input
                value={editing?.gradientStart || ''}
                onChange={(e) =>
                  editing && setEditing({ ...editing, gradientStart: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Gradient төгсгөл</Label>
              <Input
                value={editing?.gradientEnd || ''}
                onChange={(e) =>
                  editing && setEditing({ ...editing, gradientEnd: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Badge</Label>
            <Input
              value={editing?.badge || ''}
              onChange={(e) => editing && setEditing({ ...editing, badge: e.target.value })}
            />
          </div>

          <StringListEditor
            label="Давуу тал"
            items={editing?.benefits || []}
            onChange={(benefits) => editing && setEditing({ ...editing, benefits })}
            placeholder="Давуу талыг оруулна уу..."
            addLabel="Давуу тал нэмэх"
          />

          <ProductDetailSectionsEditor
            sections={editing?.detailSections || []}
            onChange={(detailSections) =>
              editing && setEditing({ ...editing, detailSections })
            }
          />

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={editing?.featured || false}
                onCheckedChange={(v) =>
                  editing && setEditing({ ...editing, featured: v === true })
                }
              />
              Онцлох
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={editing?.inStock ?? true}
                onCheckedChange={(v) =>
                  editing && setEditing({ ...editing, inStock: v === true })
                }
              />
              Нөөцтэй
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={editing?.active ?? true}
                onCheckedChange={(v) =>
                  editing && setEditing({ ...editing, active: v === true })
                }
              />
              Идэвхтэй
            </label>
          </div>
        </form>
      </AppDrawer>
    </div>
  );
}
