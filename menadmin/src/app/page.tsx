import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Activity,
  BookOpen,
  HeartPulse,
  ShoppingBag,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { LandingNav } from '@/components/landing/landing-nav';
import { StoreBadges } from '@/components/landing/store-badges';
import { TenkheeLogo } from '@/components/brand/tenkhee-logo';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SITE } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Tenkhee Plus — Эрч хүч, дотоод эрүүл мэнд',
  description:
    'Tenkhee Plus — эрэгтэчдэд зориулсан Кегелийн дасгал, pelvic stretching, эрүүл мэндийн мэдээлэл, дэлгүүр. tenkhee.mn',
  openGraph: {
    title: 'Tenkhee Plus',
    description: SITE.tagline,
    url: SITE.url,
    siteName: SITE.name,
  },
};

const features = [
  {
    icon: HeartPulse,
    title: 'Кегелийн дасгал',
    body: 'Өдөр бүрийн дасгал, түвшин, видео заавартай Kegel хөтөлбөр.',
  },
  {
    icon: Activity,
    title: 'Pelvic Stretching',
    body: 'Аарцгийн уян хатан байдал, сунгалт, тайвшралын түвшнүүд.',
  },
  {
    icon: BookOpen,
    title: 'Insights & Articles',
    body: 'Эрүүл мэндийн нийтлэл, зөвлөмж, мэргэжлийн контент.',
  },
  {
    icon: Stethoscope,
    title: 'Эмнэлэг & Coach',
    body: 'Эмнэлгийн мэдээлэл, зөвлөгөө, хувийн хөтөлбөр.',
  },
  {
    icon: ShoppingBag,
    title: 'Эрүүл мэндийн дэлгүүр',
    body: 'Витамин, хяналтын төхөөрөмж, QPay-ээр аюулгүй төлбөр.',
  },
  {
    icon: Sparkles,
    title: 'Premium гишүүнчлэл',
    body: 'Premium контент, дасгал, гишүүнчлэлийн удирдлага.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070b10] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 size-[420px] rounded-full bg-[#ff453a]/20 blur-[120px]" />
        <div className="absolute -right-20 top-40 size-[360px] rounded-full bg-[#ff453a]/15 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 size-[300px] rounded-full bg-[#3498db]/10 blur-[100px]" />
      </div>

      <div className="relative">
        <LandingNav />

        <main>
          <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-24">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ff453a]/30 bg-[#ff453a]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#ffb4af]">
                <Sparkles className="size-3.5" />
                tenkhee.mn
              </p>
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                {SITE.name}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
                {SITE.tagline}. Кегелийн дасгал, pelvic stretching, мэргэжлийн
                контент, дэлгүүр — бүгд нэг апп дотор.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#download"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'h-12 bg-[#ff453a] px-6 text-base font-semibold text-white hover:bg-[#e63e35]'
                  )}
                >
                  Апп татах
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'h-12 border-white/20 bg-white/5 px-6 text-base text-white hover:bg-white/10 hover:text-white'
                  )}
                >
                  Admin нэвтрэх
                </Link>
              </div>
              <StoreBadges className="mt-8" />
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative mx-auto aspect-[10/19] w-full max-w-[320px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-[#141a22] to-[#0a0f14] p-3 shadow-2xl shadow-black/50">
                <div className="h-full overflow-hidden rounded-[2rem] bg-[#0f1419]">
                  <div className="border-b border-white/10 px-5 pb-4 pt-8">
                    <TenkheeLogo size="sm" className="mb-3" />
                    <p className="text-xs text-white/45">Сайн байна уу 👋</p>
                    <p className="mt-1 text-lg font-bold">{SITE.name}</p>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="rounded-2xl bg-gradient-to-br from-[#ff453a] to-[#c0392b] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                        Өнөөдрийн дасгал
                      </p>
                      <p className="mt-2 text-base font-bold">Kegel Training</p>
                      <p className="mt-1 text-xs text-white/75">12 мин · Intermediate</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[10px] text-white/45">Streak</p>
                        <p className="text-lg font-bold text-[#ff453a]">7</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[10px] text-white/45">Vitality</p>
                        <p className="text-lg font-bold">84</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm font-semibold">Pelvic Stretching</p>
                      <p className="mt-1 text-xs text-white/55">
                        Beginner · 19 min · 3 exercises
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm font-semibold">Shop</p>
                      <p className="mt-1 text-xs text-white/55">
                        Эрүүл мэндийн бүтээгдэхүүн
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 top-8 hidden rounded-2xl border border-white/10 bg-[#141a22]/90 px-4 py-3 shadow-xl backdrop-blur lg:block">
                <p className="text-xs text-white/50">Premium</p>
                <p className="font-bold text-[#ff453a]">Идэвхтэй</p>
              </div>
            </div>
          </section>

          <section id="features" className="border-y border-white/10 bg-[#0a0f14]/60 py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Бүх зүйл нэг дор
                </h2>
                <p className="mt-3 text-white/60">
                  Tenkhee Plus нь дасгал, мэдлэг, дэлгүүр, гишүүнчлэлийг нэгэн
                  дотор нэгтгэнэ.
                </p>
              </div>
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {features.map(({ icon: Icon, title, body }) => (
                  <article
                    key={title}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#ff453a]/30 hover:bg-white/[0.05]"
                  >
                    <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-[#ff453a]/15 text-[#ff453a]">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">{body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="download" className="py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#ff453a]/20 via-[#141a22] to-[#ff453a]/10 p-8 sm:p-12">
                <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                      Апп-аа татаад эхлээрэй
                    </h2>
                    <p className="mt-4 max-w-lg text-white/70">
                      iOS болон Android дээр {SITE.name}-ийг суулгаад өнөөдрөөс
                      эхлэн дотоод эрүүл мэндийн өдөр тутмын хэвшилд оролцоорой.
                    </p>
                    <StoreBadges className="mt-8" size="large" />
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
                    <h3 className="font-semibold">Холбоо барих</h3>
                    <ul className="mt-4 space-y-3 text-sm text-white/70">
                      <li>
                        <span className="text-white/45">И-мэйл: </span>
                        <a
                          href={`mailto:${SITE.supportEmail}`}
                          className="font-medium text-[#ff453a] hover:underline"
                        >
                          {SITE.supportEmail}
                        </a>
                      </li>
                      <li>
                        <span className="text-white/45">Вэб: </span>
                        <span className="font-medium text-white">{SITE.domain}</span>
                      </li>
                      <li>
                        <Link href="/support" className="font-medium text-[#ff453a] hover:underline">
                          Дэмжлэгийн хуудас →
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/10 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-white/50 sm:flex-row sm:px-6 sm:text-left">
            <p>© {new Date().getFullYear()} {SITE.name}. Бүх эрх хамгаалагдсан.</p>
            <div className="flex flex-wrap justify-center gap-4 sm:justify-end">
              <Link href="/privacy" className="hover:text-white">
                Нууцлал
              </Link>
              <Link href="/support" className="hover:text-white">
                Дэмжлэг
              </Link>
              <Link href="/login" className="hover:text-[#ff453a]">
                Admin
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
