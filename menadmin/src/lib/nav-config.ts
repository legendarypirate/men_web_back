import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Newspaper,
  Lightbulb,
  MessageSquareQuote,
  MessageSquare,
  Bell,
  Star,
  CreditCard,
  Settings,
  ShoppingBag,
  Package,
  Activity,
  ClipboardList,
  ListChecks,
  Hospital,
  Stethoscope,
  UserCircle2,
  CircleHelp,
  Trophy,
  StretchHorizontal,
  Flame,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  group: 'overview' | 'workouts' | 'content' | 'commerce' | 'users';
};

export const adminNav: NavItem[] = [
  { href: '/dashboard', label: 'Хяналт', icon: LayoutDashboard, group: 'overview' },
  { href: '/users', label: 'Хэрэглэгчид', icon: Users, group: 'users' },
  { href: '/notifications', label: 'Push мэдэгдэл', icon: Bell, group: 'users' },
  { href: '/feedback', label: 'Санал хүсэлт', icon: MessageSquare, group: 'users' },
  { href: '/sessions', label: 'Дасгалын сесс', icon: Activity, group: 'users' },
  { href: '/kegel-programs', label: 'Кегел хөтөлбөр', icon: Dumbbell, group: 'workouts' },
  { href: '/kegel-challenges', label: 'Кегел сорилт', icon: Trophy, group: 'workouts' },
  { href: '/pelvic-stretching', label: 'Pelvic Stretching', icon: StretchHorizontal, group: 'workouts' },
  { href: '/groin-fitness', label: 'Groin Fitness', icon: Flame, group: 'workouts' },
  { href: '/coach', label: 'Коуч', icon: UserCircle2, group: 'content' },
  { href: '/faq', label: 'FAQ story', icon: CircleHelp, group: 'content' },
  { href: '/hospital-categories', label: 'Эмнэлгийн төрөл', icon: Stethoscope, group: 'content' },
  { href: '/hospitals', label: 'Эмнэлэг', icon: Hospital, group: 'content' },
  { href: '/articles', label: 'Нийтлэлүүд', icon: Newspaper, group: 'content' },
  { href: '/health-bites', label: 'Эрүүл мэнд', icon: Lightbulb, group: 'content' },
  { href: '/home-pro-tips', label: 'Нүүр зөвлөмж', icon: MessageSquareQuote, group: 'content' },
  { href: '/assessment', label: 'Үнэлгээ', icon: ClipboardList, group: 'content' },
  { href: '/quiz-manage', label: 'Quiz', icon: ListChecks, group: 'content' },
  { href: '/products', label: 'Дэлгүүрийн бараа', icon: ShoppingBag, group: 'commerce' },
  { href: '/orders', label: 'Захиалгууд', icon: Package, group: 'commerce' },
  { href: '/plans', label: 'Premium төлөвлөгөө', icon: Star, group: 'commerce' },
  { href: '/payments', label: 'QPay төлбөр', icon: CreditCard, group: 'commerce' },
  { href: '/settings', label: 'Тохиргоо', icon: Settings, group: 'commerce' },
];

export const navGroups: { key: NavItem['group']; label: string }[] = [
  { key: 'overview', label: 'Ерөнхий' },
  { key: 'users', label: 'Хэрэглэгч' },
  { key: 'workouts', label: 'Дасгал' },
  { key: 'content', label: 'Агуулга' },
  { key: 'commerce', label: 'Дэлгүүр & Төлбөр' },
];
