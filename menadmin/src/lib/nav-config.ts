import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Newspaper,
  Lightbulb,
  Star,
  CreditCard,
  Settings,
  ShoppingBag,
  Package,
  Activity,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  group: 'overview' | 'content' | 'commerce' | 'users';
};

export const adminNav: NavItem[] = [
  { href: '/dashboard', label: 'Хяналт', icon: LayoutDashboard, group: 'overview' },
  { href: '/users', label: 'Хэрэглэгчид', icon: Users, group: 'users' },
  { href: '/sessions', label: 'Дасгалын сесс', icon: Activity, group: 'users' },
  { href: '/workouts', label: 'Дасгалууд', icon: Dumbbell, group: 'content' },
  { href: '/articles', label: 'Нийтлэлүүд', icon: Newspaper, group: 'content' },
  { href: '/health-bites', label: 'Эрүүл мэнд', icon: Lightbulb, group: 'content' },
  { href: '/assessment', label: 'Үнэлгээ', icon: ClipboardList, group: 'content' },
  { href: '/products', label: 'Дэлгүүрийн бараа', icon: ShoppingBag, group: 'commerce' },
  { href: '/orders', label: 'Захиалгууд', icon: Package, group: 'commerce' },
  { href: '/plans', label: 'Premium төлөвлөгөө', icon: Star, group: 'commerce' },
  { href: '/payments', label: 'QPay төлбөр', icon: CreditCard, group: 'commerce' },
  { href: '/settings', label: 'Тохиргоо', icon: Settings, group: 'commerce' },
];

export const navGroups: { key: NavItem['group']; label: string }[] = [
  { key: 'overview', label: 'Ерөнхий' },
  { key: 'users', label: 'Хэрэглэгч' },
  { key: 'content', label: 'Агуулга' },
  { key: 'commerce', label: 'Дэлгүүр & Төлбөр' },
];

export const DEMO_ADMIN = {
  email: 'admin@vitalmen.mn',
  password: 'VitalMen@2026',
};
