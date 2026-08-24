'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, Article } from '@/lib/api';
import { ArticleStorySlidesEditor } from '@/components/admin/article-story-slides-editor';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { articleConfig } from '@/lib/resource-configs';
import { buildStorySlidesFromArticle } from '@/lib/article-story-slides';
import { AppDrawer } from '@/components/custom/app-drawer';
import { AppTable } from '@/components/custom/app-table';
import { useConfirm } from '@/components/custom/confirm-provider';
import { AddButton } from '@/components/custom/add-button';
import { ErrorState, LoadingState, PageHeader } from '@/components/page-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categoryOptions = [
  { label: 'Шилдэг сонголтууд', value: 'Шилдэг сонголтууд' },
  { label: 'Бэлгийн эрүүл мэнд', value: 'Бэлгийн эрүүл мэнд' },
  { label: 'Сэргээлт', value: 'Сэргээлт' },
  { label: 'Хоол тэжээл', value: 'Хоол тэжээл' },
  { label: 'Шинжлэх ухаан', value: 'Шинжлэх ухаан' },
];

const emptyArticle = (): Article => ({
  id: '',
  category: 'Сэргээлт',
  title: '',
  excerpt: '',
  body: '',
  readMinutes: 5,
  featured: false,
  premium: false,
  isNew: false,
  sortOrder: 0,
  published: true,
  storySlides: [],
});

export default function ArticlesPage() {
  const confirm = useConfirm();
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.articles.list();
      setArticles(res.data.articles);
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

  function openCreate() {
    setEditing(emptyArticle());
    setShowForm(true);
  }

  function openEdit(article: Article) {
    setEditing({
      ...article,
      storySlides: Array.isArray(article.storySlides) ? [...article.storySlides] : [],
    });
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        ...editing,
        storySlides: editing.storySlides || [],
      };
      if (editing.id && articles.some((a) => a.id === editing.id)) {
        await api.articles.update(editing.id, payload);
      } else {
        await api.articles.create(payload);
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
      title: 'Нийтлэл устгах уу?',
      description: 'Энэ үйлдлийг буцаах боломжгүй.',
      confirmLabel: 'Устгах',
      destructive: true,
    });
    if (!ok) return;
    await api.articles.remove(id);
    load();
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title={articleConfig.title}
        subtitle={`${articles.length} ${articleConfig.itemLabel}`}
        action={<AddButton label={`${articleConfig.itemLabel} нэмэх`} onClick={openCreate} disabled={saving} />}
      />

      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      <AppTable
        columns={[
          ...articleConfig.columns,
          {
            key: 'storySlides',
            label: 'Slides',
            align: 'center',
            render: (row) =>
              Array.isArray(row.storySlides) && row.storySlides.length > 0
                ? row.storySlides.length
                : '—',
          },
        ]}
        rows={articles}
        idKey="id"
        onEdit={openEdit}
        onDelete={(row) => handleDelete(row.id)}
      />

      <AppDrawer
        open={showForm}
        onOpenChange={setShowForm}
        title={editing?.id && articles.some((a) => a.id === editing.id) ? 'Нийтлэл засах' : 'Шинэ нийтлэл'}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Болих
            </Button>
            <Button type="submit" form="article-form" disabled={saving}>
              {saving ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </>
        }
      >
        {editing && (
          <form id="article-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Ангилал</Label>
                <Select
                  value={editing.category}
                  onValueChange={(value) =>
                    value && setEditing({ ...editing, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Унших минут</Label>
                <Input
                  type="number"
                  value={editing.readMinutes}
                  onChange={(e) =>
                    setEditing({ ...editing, readMinutes: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Гарчиг</Label>
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Товч</Label>
              <Textarea
                value={editing.excerpt}
                onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Body (fallback текст)</Label>
              <Textarea
                value={editing.body || ''}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                rows={4}
              />
            </div>

            <ImageUploadField
              label="Cover зураг"
              value={editing.imageUrl}
              onChange={(url) => setEditing({ ...editing, imageUrl: url || undefined })}
              onUpload={async (file) => {
                const result = await api.upload.image(file);
                return result.url;
              }}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Зохиогч</Label>
                <Input
                  value={editing.author || ''}
                  onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tag</Label>
                <Input
                  value={editing.tag || ''}
                  onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Эрэмбэ</Label>
              <Input
                type="number"
                value={editing.sortOrder}
                onChange={(e) =>
                  setEditing({ ...editing, sortOrder: Number(e.target.value) })
                }
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['featured', 'Онцлох'],
                ['isNew', 'Шинэ'],
                ['premium', 'Premium'],
                ['published', 'Нийтлэх'],
              ].map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <Label>{label}</Label>
                  <Switch
                    checked={Boolean(editing[key as keyof Article])}
                    onCheckedChange={(checked) =>
                      setEditing({ ...editing, [key]: checked })
                    }
                  />
                </div>
              ))}
            </div>

            <ArticleStorySlidesEditor
              article={editing}
              slides={editing.storySlides || []}
              onChange={(storySlides) => setEditing({ ...editing, storySlides })}
              onUploadImage={async (file) => {
                const result = await api.upload.image(file);
                return result.url;
              }}
            />

            {(editing.storySlides?.length || 0) === 0 && editing.title.trim() && (
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setEditing({
                    ...editing,
                    storySlides: buildStorySlidesFromArticle(editing),
                  })
                }
              >
                Story slides автоматаар үүсгэх
              </Button>
            )}
          </form>
        )}
      </AppDrawer>
    </div>
  );
}
