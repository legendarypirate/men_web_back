'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { api, Article, ArticleCategoryRecord } from '@/lib/api';
import { ArticleCategoryGrid } from '@/components/admin/article-category-grid';
import { ArticleStorySlidesEditor } from '@/components/admin/article-story-slides-editor';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { articleCategoryOptions, articleConfig } from '@/lib/resource-configs';
import { buildStorySlidesFromArticle, slidesHaveContent } from '@/lib/article-story-slides';
import { AppDrawer } from '@/components/custom/app-drawer';
import { AppTable } from '@/components/custom/app-table';
import { useConfirm } from '@/components/custom/confirm-provider';
import { AddButton } from '@/components/custom/add-button';
import { ErrorState, LoadingState, PageHeader } from '@/components/page-ui';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

const emptyArticle = (category: string): Article => ({
  id: '',
  category,
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

function buildCategories(articles: Article[], categoryRecords: ArticleCategoryRecord[]) {
  const counts = new Map<string, number>();
  for (const article of articles) {
    counts.set(article.category, (counts.get(article.category) || 0) + 1);
  }

  const byName = new Map<string, ArticleCategoryRecord>();
  for (const record of categoryRecords) {
    byName.set(record.name, record);
  }
  for (const name of counts.keys()) {
    if (!byName.has(name)) {
      byName.set(name, { id: '', name, sortOrder: 999 });
    }
  }

  return Array.from(byName.values())
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name, 'mn');
    })
    .map((record) => ({
      ...record,
      count: counts.get(record.name) || 0,
    }));
}

export default function ArticlesPage() {
  const confirm = useConfirm();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categoryRecords, setCategoryRecords] = useState<ArticleCategoryRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [saving, setSaving] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryReordering, setCategoryReordering] = useState(false);

  const categories = useMemo(
    () => buildCategories(articles, categoryRecords),
    [articles, categoryRecords]
  );

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ label: category.name, value: category.name })),
    [categories]
  );

  const filteredArticles = useMemo(
    () =>
      selectedCategory
        ? articles.filter((article) => article.category === selectedCategory)
        : [],
    [articles, selectedCategory]
  );

  const tableColumns = useMemo(
    () =>
      [
        ...articleConfig.columns.filter((column) =>
          selectedCategory ? column.key !== 'category' : true
        ),
        {
          key: 'storySlides',
          label: 'Slides',
          align: 'center' as const,
          render: (row: Article) =>
            Array.isArray(row.storySlides) && row.storySlides.length > 0
              ? row.storySlides.length
              : '—',
        },
      ],
    [selectedCategory]
  );

  async function load() {
    setLoading(true);
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        api.articles.list(),
        api.articleCategories.list(),
      ]);
      setArticles(articlesRes.data.articles);
      setCategoryRecords(categoriesRes.data.categories);
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
    if (!selectedCategory) return;
    setEditing(emptyArticle(selectedCategory));
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
      const { id, ...rest } = editing;
      const rawSlides = editing.storySlides || [];
      const storySlides = slidesHaveContent(rawSlides)
        ? rawSlides
        : buildStorySlidesFromArticle(editing);
      const payload = {
        ...rest,
        storySlides,
      };
      if (id && articles.some((a) => a.id === id)) {
        await api.articles.update(id, payload);
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

  async function handleCreateCategory(e: FormEvent) {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;

    setCategorySaving(true);
    try {
      await api.articleCategories.create({ name });
      setShowCategoryForm(false);
      setNewCategoryName('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ангилал нэмэхэд алдаа');
    } finally {
      setCategorySaving(false);
    }
  }

  async function handleReorderCategories(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const previousRecords = categoryRecords;
    const recordByName = new Map(categoryRecords.map((record) => [record.name, record]));
    const optimisticRecords = reordered.map((category, index) => {
      const existing = recordByName.get(category.name);
      return existing
        ? { ...existing, sortOrder: index }
        : { id: category.id, name: category.name, sortOrder: index };
    });

    setCategoryRecords(optimisticRecords);
    setCategoryReordering(true);
    setError('');

    try {
      const res = await api.articleCategories.reorder({
        names: reordered.map((category) => category.name),
      });
      setCategoryRecords(res.data.categories);
    } catch (err) {
      setCategoryRecords(previousRecords);
      setError(err instanceof Error ? err.message : 'Дараалал хадгалахад алдаа');
    } finally {
      setCategoryReordering(false);
    }
  }

  async function handleDeleteCategory(category: { id: string; name: string; count: number }) {
    const articleWarning =
      category.count > 0
        ? ` Энэ ангилалд ${category.count} нийтлэл байгаа тул бүгд устгагдана.`
        : '';

    const ok = await confirm({
      title: 'Ангилал устгах уу?',
      description: `"${category.name}" ангиллыг устгах уу?${articleWarning}`,
      confirmLabel: 'Устгах',
      destructive: true,
    });
    if (!ok) return;

    try {
      if (category.id) {
        await api.articleCategories.remove(category.id);
      } else {
        await api.articleCategories.removeByName(category.name);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ангилал устгахад алдаа');
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      {selectedCategory == null ? (
        <>
          <PageHeader
            title={articleConfig.title}
            subtitle={`${categories.length} ангилал · чирж дараалал солино`}
            action={
              <AddButton
                label="Ангилал нэмэх"
                onClick={() => {
                  setNewCategoryName('');
                  setShowCategoryForm(true);
                }}
                disabled={categorySaving}
              />
            }
          />

          {error && (
            <div className="mb-4">
              <ErrorState message={error} />
            </div>
          )}

          <ArticleCategoryGrid
            categories={categories}
            reordering={categoryReordering}
            onOpen={setSelectedCategory}
            onDelete={handleDeleteCategory}
            onReorder={handleReorderCategories}
          />
        </>
      ) : (
        <>
          <PageHeader
            title={selectedCategory}
            subtitle={`${filteredArticles.length} ${articleConfig.itemLabel}`}
            action={
              <AddButton
                label={`${articleConfig.itemLabel} нэмэх`}
                onClick={openCreate}
                disabled={saving}
              />
            }
          />

          <div className="mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ml-2 gap-2"
              onClick={() => setSelectedCategory(null)}
            >
              <ArrowLeft className="size-4" />
              Ангилал руу буцах
            </Button>
          </div>

          {error && (
            <div className="mb-4">
              <ErrorState message={error} />
            </div>
          )}

          <AppTable
            columns={tableColumns}
            rows={filteredArticles}
            idKey="id"
            onEdit={openEdit}
            onDelete={(row) => handleDelete(row.id)}
          />
        </>
      )}

      <AppDrawer
        open={showForm}
        onOpenChange={setShowForm}
        title={
          editing?.id && articles.some((a) => a.id === editing.id)
            ? 'Нийтлэл засах'
            : 'Шинэ нийтлэл'
        }
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

      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Шинэ ангилал</DialogTitle>
          </DialogHeader>
          <form id="article-category-form" onSubmit={handleCreateCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Ангиллын нэр</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Жишээ нь: Дасгал"
                required
                autoFocus
              />
            </div>
          </form>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCategoryForm(false)}
            >
              Болих
            </Button>
            <Button
              type="submit"
              form="article-category-form"
              disabled={categorySaving || !newCategoryName.trim()}
            >
              {categorySaving ? 'Хадгалж байна...' : 'Нэмэх'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
