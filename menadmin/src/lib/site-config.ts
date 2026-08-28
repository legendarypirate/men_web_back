/** Matches Flutter accent red (e.g. dashboard, premium, workout CTAs). */
export const BRAND = {
  bg: '#070b10',
  surface: '#0a0f14',
  card: '#141a22',
  accent: '#ff453a',
  accentHover: '#e63e35',
  accentSoft: '#ffb4af',
} as const;

export const SITE = {
  name: 'Tenkhee Plus',
  tagline: 'Эрч хүч, дотоод эрүүл мэнд, илүү сайхан амьдрал',
  domain: 'tenkhee.mn',
  url: 'https://tenkhee.mn',
  supportEmail: 'support@tenkhee.mn',
  infoEmail: 'info@tenkhee.mn',
  appStoreUrl: 'https://apps.apple.com/app/tenkhee-plus',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=mn.vitalmen.mgl',
} as const;

export const LANDING_NAV = [
  { href: '#features', label: 'Боломжууд' },
  { href: '/quiz', label: 'Quiz' },
  { href: '#download', label: 'Апп татах' },
  { href: '/support', label: 'Дэмжлэг' },
  { href: '/privacy', label: 'Нууцлал' },
] as const;
