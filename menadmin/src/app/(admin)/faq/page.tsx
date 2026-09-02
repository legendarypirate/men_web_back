'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, Article } from '@/lib/api';
import { ArticleStorySlidesEditor } from '@/components/admin/article-story-slides-editor';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { AddButton } from '@/components/custom/add-button';
import { useConfirm } from '@/components/custom/confirm-provider';
import { ErrorState, LoadingState, PageHeader } from '@/components/page-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const FAQ_CATEGORY = 'FAQ';

const emptyFaq = (): Article => ({
  id: '',
  category: FAQ_CATEGORY,
  title: '',
  excerpt: 'Хэрхэн ажилладаг, ямар үр дүн өгөхийг үзнэ үү.',
  body: '',
  tag: FAQ_CATEGORY,
  readMinutes: 3,
  featured: false,
  premium: false,
  isNew: false,
  sortOrder: 0,
  published: true,
  isOnboarding: false,
  storySlides: [],
});

export default function FaqStoriesPage() {
  const confirm = useConfirm();
  const [items, setItems] = useState<Article[]>([]);
  const [editing, setEditing] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await api.articles.list();
      const faqs = (res.data.articles || [])
        .filter(
          (article) =>
            article.category === FAQ_CATEGORY || article.tag === FAQ_CATEGORY
        )
        .sort((a, b) => a.sortOrder - b.sortOrder);
      setItems(faqs);
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

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        ...editing,
        category: FAQ_CATEGORY,
        tag: FAQ_CATEGORY,
      };
      if (editing.id) {
        await api.articles.update(editing.id, payload);
      } else {
        const { id: _id, ...createData } = payload;
        await api.articles.create(createData);
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Хадгалахад алдаа');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(article: Article) {
    const ok = await confirm({
      title: 'FAQ устгах уу?',
      description: `"${article.title}" story-г устгах уу?`,
      confirmLabel: 'Устгах',
      destructive: true,
    });
    if (!ok) return;
    await api.articles.remove(article.id);
    if (editing?.id === article.id) setEditing(null);
    await load();
  }

  async function handleSetOnboarding(article: Article) {
    if (article.isOnboarding) return;
    try {
      await api.articles.update(article.id, {
        isOnboarding: true,
        published: true,
      });
      setEditing((current) => {
        if (!current) return current;
        if (current.id === article.id) {
          return { ...current, isOnboarding: true, published: true };
        }
        return { ...current, isOnboarding: false };
      });
      setError('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Эхлэл болгоход алдаа');
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="FAQ story"
        subtitle="Нүүр дээрх info товч → энэ жагсаалт. «Эхлэл болгох» нь апп анх нээгдэхэд заавал үзүүлэх story. Зөвхөн нэг FAQ эхлэл байж болно."
        action={
          <AddButton
            label="FAQ нэмэх"
            onClick={() =>
              setEditing({
                ...emptyFaq(),
                sortOrder: items.length,
              })
            }
          />
        }
      />

      {error && <ErrorState message={error} />}

      <div className="space-y-2">
        {items.length === 0 && !editing && (
          <p className="text-sm text-muted-foreground">
            FAQ байхгүй. Нэмэх товчоор карт үүсгэнэ.
          </p>
        )}
        {items.map((article) => (
          <div
            key={article.id}
            className="flex items-center gap-4 rounded-xl border bg-card p-3"
          >
            {article.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.imageUrl}
                alt=""
                className="h-16 w-24 rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-24 rounded-lg bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold truncate">{article.title}</p>
                {article.isOnboarding && (
                  <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600">
                    Эхлэл
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {article.excerpt}
              </p>
            </div>
            {article.isOnboarding ? (
              <Button type="button" variant="secondary" size="sm" disabled>
                Эхлэл
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSetOnboarding(article)}
              >
                Эхлэл болгох
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditing(article)}
            >
              Засах
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(article)}
            >
              Устгах
            </Button>
          </div>
        ))}
      </div>

      {editing && (
        <form onSubmit={handleSave} className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            {editing.id ? 'FAQ засах' : 'Шинэ FAQ'}
          </h2>
          <div className="space-y-2">
            <Label>Гарчиг</Label>
            <Input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Тайлбар (картын доор)</Label>
            <Textarea
              value={editing.excerpt}
              onChange={(e) =>
                setEditing({ ...editing, excerpt: e.target.value })
              }
              rows={2}
            />
          </div>
          <ImageUploadField
            label="Картын зураг"
            value={editing.imageUrl}
            onChange={(url) =>
              setEditing({ ...editing, imageUrl: url || undefined })
            }
            onUpload={async (file) => {
              const result = await api.upload.image(file);
              return result.url;
            }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Дараалал</Label>
              <Input
                type="number"
                value={editing.sortOrder}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    sortOrder: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center justify-between rounded-lg border p-3 w-full">
                <Label htmlFor="faq-published">Идэвхтэй</Label>
                <Switch
                  id="faq-published"
                  checked={editing.published}
                  onCheckedChange={(checked) =>
                    setEditing({ ...editing, published: checked })
                  }
                />
              </div>
            </div>
            <div className="flex items-end sm:col-span-2">
              <div className="flex items-center justify-between rounded-lg border p-3 w-full gap-4">
                <div>
                  <Label htmlFor="faq-onboarding">Эхлэл (onboarding)</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Апп анх нээгдэхэд энэ story-г заавал үзүүлнэ. Өмнөх эхлэл автоматаар цуцлагдана.
                  </p>
                </div>
                <Switch
                  id="faq-onboarding"
                  checked={Boolean(editing.isOnboarding)}
                  onCheckedChange={(checked) =>
                    setEditing({
                      ...editing,
                      isOnboarding: checked,
                      published: checked ? true : editing.published,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <ArticleStorySlidesEditor
            article={editing}
            slides={editing.storySlides || []}
            onChange={(storySlides) => setEditing({ ...editing, storySlides })}
            onUploadImage={async (file) => {
              const result = await api.upload.image(file);
              return result.url;
            }}
            onUploadVideo={async (file) => {
              const result = await api.upload.video(file);
              return {
                url: result.url,
                thumbnailUrl: result.thumbnailUrl,
                duration: result.duration,
              };
            }}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(null)}
            >
              Болих
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
