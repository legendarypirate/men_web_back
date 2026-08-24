import { ResourceConfig } from '@/lib/types/fields';
import { Product, AssessmentQuestion, Article, HealthBite, PremiumPlan, Hospital, CoachProgram, PromoCode } from '@/lib/api';
import { formatMnt } from '@/lib/api';
import { StatusBadge } from '@/components/page-ui';

const categoryOptions = [
  { label: 'Витамин', value: 'supplements' },
  { label: 'Тоног төхөөрөмж', value: 'devices' },
  { label: 'Сэргээлт', value: 'wellness' },
  { label: 'Хоол тэжээл', value: 'nutrition' },
];

export const productConfig: ResourceConfig<Product> = {
  title: 'Дэлгүүрийн бүтээгдэхүүн',
  itemLabel: 'бүтээгдэхүүн',
  idKey: 'id',
  listKey: 'products',
  itemKey: 'product',
  emptyDefaults: {
    category: 'supplements',
    icon: 'shopping_bag',
    gradientStart: '#0F766E',
    gradientEnd: '#14B8A6',
    benefits: [],
    rating: 4.5,
    reviewCount: 0,
    inStock: true,
    featured: false,
    active: true,
    sortOrder: 0,
    priceMnt: 0,
    images: [],
  },
  fields: [
    { key: 'id', label: 'ID', type: 'text', required: true, showOnEdit: true, showOnCreate: true },
    { key: 'name', label: 'Нэр', type: 'text', required: true },
    { key: 'description', label: 'Тайлбар', type: 'textarea', required: true, rows: 4 },
    { key: 'priceMnt', label: 'Үнэ (₮)', type: 'number', required: true },
    { key: 'category', label: 'Ангилал', type: 'select', options: categoryOptions },
    { key: 'icon', label: 'Icon (Material name)', type: 'text', placeholder: 'fitness_center' },
    { key: 'gradientStart', label: 'Gradient эхлэл (#hex)', type: 'text' },
    { key: 'gradientEnd', label: 'Gradient төгсгөл (#hex)', type: 'text' },
    { key: 'benefits', label: 'Давуу тал', type: 'string-list', placeholder: 'Давуу талыг оруулна уу...', hint: 'Давуу тал нэмэх' },
    { key: 'rating', label: 'Rating', type: 'number' },
    { key: 'reviewCount', label: 'Сэтгэгдэл тоо', type: 'number' },
    { key: 'badge', label: 'Badge', type: 'text' },
    { key: 'sortOrder', label: 'Эрэмбэ', type: 'number' },
    { key: 'featured', label: 'Онцлох', type: 'switch' },
    { key: 'inStock', label: 'Нөөцтэй', type: 'switch' },
    { key: 'active', label: 'Идэвхтэй', type: 'switch' },
  ],
  columns: [
    { key: 'name', label: 'Бүтээгдэхүүн', className: 'font-medium' },
    {
      key: 'category',
      label: 'Ангилал',
      render: (row) => categoryOptions.find((c) => c.value === row.category)?.label || row.category,
    },
    { key: 'priceMnt', label: 'Үнэ', align: 'center', render: (row) => formatMnt(row.priceMnt) },
    { key: 'featured', label: 'Онцлох', align: 'center', render: (row) => (row.featured ? '✓' : '—') },
    { key: 'inStock', label: 'Нөөц', align: 'center', render: (row) => (row.inStock ? '✓' : '—') },
  ],
};

export const assessmentConfig: ResourceConfig<AssessmentQuestion> = {
  title: 'Үнэлгээний асуултууд',
  itemLabel: 'асуулт',
  idKey: 'id',
  listKey: 'questions',
  itemKey: 'question',
  emptyDefaults: {
    step: 1,
    totalSteps: 9,
    options: [],
    sortOrder: 0,
    active: true,
  },
  fields: [
    { key: 'id', label: 'ID', type: 'text', required: true },
    { key: 'questionKey', label: 'Question key', type: 'text', required: true },
    { key: 'title', label: 'Асуулт', type: 'text', required: true },
    { key: 'helpText', label: 'Тайлбар', type: 'textarea', rows: 2 },
    { key: 'step', label: 'Алхам', type: 'number' },
    { key: 'totalSteps', label: 'Нийт алхам', type: 'number' },
    {
      key: 'options',
      label: 'Сонголтууд (JSON)',
      type: 'json',
      rows: 8,
      hint: '[{"key":"a","title":"...","description":"..."}]',
    },
    { key: 'sortOrder', label: 'Эрэмбэ', type: 'number' },
    { key: 'active', label: 'Идэвхтэй', type: 'switch' },
  ],
  columns: [
    { key: 'questionKey', label: 'Key', className: 'font-mono text-xs' },
    { key: 'title', label: 'Асуулт', className: 'max-w-md truncate' },
    { key: 'step', label: 'Алхам', align: 'center', render: (row) => `${row.step}/${row.totalSteps}` },
    { key: 'sortOrder', label: 'Эрэмбэ', align: 'center' },
    { key: 'active', label: 'Төлөв', render: (row) => <StatusBadge status={row.active ? 'active' : 'cancelled'} /> },
  ],
};

const articleCategoryOptions = [
  { label: 'Шилдэг сонголтууд', value: 'Шилдэг сонголтууд' },
  { label: 'Бэлгийн эрүүл мэнд', value: 'Бэлгийн эрүүл мэнд' },
  { label: 'Сэргээлт', value: 'Сэргээлт' },
  { label: 'Хоол тэжээл', value: 'Хоол тэжээл' },
  { label: 'Шинжлэх ухаан', value: 'Шинжлэх ухаан' },
];

export const articleConfig: ResourceConfig<Article> = {
  title: 'Нийтлэлүүд',
  itemLabel: 'нийтлэл',
  idKey: 'id',
  listKey: 'articles',
  itemKey: 'article',
  emptyDefaults: {
    category: 'Сэргээлт',
    featured: false,
    premium: false,
    isNew: false,
    readMinutes: 5,
    sortOrder: 0,
    published: true,
  },
  fields: [
    { key: 'category', label: 'Ангилал', type: 'select', options: articleCategoryOptions, required: true },
    { key: 'title', label: 'Гарчиг', type: 'text', required: true },
    { key: 'excerpt', label: 'Товч', type: 'textarea', required: true },
    { key: 'body', label: 'Body (fallback)', type: 'textarea', rows: 4, hint: 'Story slides байхгүй үед ашиглана' },
    { key: 'imageUrl', label: 'Cover зураг', type: 'image-upload' },
    { key: 'author', label: 'Зохиогч', type: 'text' },
    { key: 'readMinutes', label: 'Унших минут', type: 'number' },
    { key: 'tag', label: 'Tag', type: 'text' },
    { key: 'sortOrder', label: 'Эрэмбэ', type: 'number' },
    { key: 'featured', label: 'Онцлох (Шилдэг сонголтууд)', type: 'switch' },
    { key: 'isNew', label: 'Шинэ', type: 'switch' },
    { key: 'premium', label: 'Premium', type: 'switch' },
    { key: 'published', label: 'Нийтлэх', type: 'switch' },
  ],
  columns: [
    { key: 'title', label: 'Гарчиг', className: 'font-medium max-w-xs truncate' },
    { key: 'category', label: 'Ангилал' },
    { key: 'sortOrder', label: 'Эрэмбэ', align: 'center' },
    { key: 'readMinutes', label: 'Мин', align: 'center' },
    { key: 'featured', label: 'Онцлох', align: 'center', render: (r) => (r.featured ? '✓' : '—') },
    { key: 'published', label: 'Нийтлэсэн', align: 'center', render: (r) => (r.published ? '✓' : '—') },
  ],
};

export const healthBiteConfig: ResourceConfig<HealthBite> = {
  title: 'Эрүүл мэндийн зөвлөмж',
  itemLabel: 'зөвлөмж',
  idKey: 'id',
  listKey: 'healthBites',
  itemKey: 'healthBite',
  emptyDefaults: { icon: 'lightbulb', sortOrder: 0 },
  fields: [
    { key: 'title', label: 'Гарчиг', type: 'text', required: true },
    { key: 'body', label: 'Агуулга', type: 'textarea', required: true, rows: 4 },
    { key: 'icon', label: 'Icon', type: 'text' },
    { key: 'sortOrder', label: 'Эрэмбэ', type: 'number' },
  ],
  columns: [
    { key: 'title', label: 'Гарчиг', className: 'font-medium' },
    { key: 'icon', label: 'Icon' },
    { key: 'sortOrder', label: 'Эрэмбэ', align: 'center' },
  ],
};

export const planConfig: ResourceConfig<PremiumPlan> = {
  title: 'Premium төлөвлөгөө',
  itemLabel: 'төлөвлөгөө',
  idKey: 'id',
  listKey: 'plans',
  itemKey: 'plan',
  emptyDefaults: {
    features: [],
    highlighted: false,
    useInfinity: false,
    buttonLabel: 'Сонгох',
    sortOrder: 0,
    amountMnt: 0,
  },
  fields: [
    { key: 'id', label: 'ID', type: 'text', required: true },
    { key: 'title', label: 'Гарчиг', type: 'text', required: true },
    { key: 'amountMnt', label: 'Үнэ (₮)', type: 'number', required: true },
    { key: 'periodLabel', label: 'Хугацаа', type: 'text', placeholder: '/сар' },
    { key: 'features', label: 'Онцлогууд (JSON)', type: 'json' },
    { key: 'badge', label: 'Badge', type: 'text' },
    { key: 'saveText', label: 'Хэмнэлт текст', type: 'text' },
    { key: 'buttonLabel', label: 'Товч текст', type: 'text' },
    { key: 'sortOrder', label: 'Эрэмбэ', type: 'number' },
    { key: 'highlighted', label: 'Онцлох', type: 'switch' },
    { key: 'useInfinity', label: '∞ icon', type: 'switch' },
  ],
  columns: [
    { key: 'title', label: 'Төлөвлөгөө', className: 'font-medium' },
    { key: 'amountMnt', label: 'Үнэ', render: (r) => formatMnt(r.amountMnt) },
    { key: 'periodLabel', label: 'Хугацаа' },
    { key: 'highlighted', label: 'Онцлох', render: (r) => (r.highlighted ? '✓' : '—') },
  ],
};

const coachSectionOptions = [
  { label: 'Main program', value: 'main' },
  { label: 'Recommended', value: 'recommended' },
  { label: 'Courses', value: 'courses' },
];

export const hospitalConfig: ResourceConfig<Hospital> = {
  title: 'Эмнэлгүүд',
  itemLabel: 'эмнэлэг',
  idKey: 'id',
  listKey: 'hospitals',
  itemKey: 'hospital',
  emptyDefaults: {
    tags: [],
    doctors: [],
    services: [],
    sortOrder: 0,
    active: true,
  },
  fields: [
    { key: 'id', label: 'ID', type: 'text', required: true },
    { key: 'name', label: 'Нэр', type: 'text', required: true },
    { key: 'address', label: 'Хаяг', type: 'textarea', required: true, rows: 2 },
    { key: 'phone', label: 'Утас', type: 'text', required: true },
    { key: 'imageUrl', label: 'Зураг', type: 'image-upload' },
    { key: 'openHours', label: 'Ажиллах цаг', type: 'text' },
    { key: 'description', label: 'Тайлбар', type: 'textarea', required: true, rows: 3 },
    { key: 'tags', label: 'Tag-ууд', type: 'string-list', placeholder: 'Tag...', hint: 'Tag нэмэх' },
    {
      key: 'doctors',
      label: 'Эмч нар (JSON)',
      type: 'json',
      rows: 8,
      hint: '[{"id":"d1","name":"...","specialty":"..."}]',
    },
    {
      key: 'services',
      label: 'Үйлчилгээ (JSON)',
      type: 'json',
      rows: 10,
      hint: '[{"id":"s1","name":"...","priceMnt":45000,"category":"...","doctorId":"d1"}]',
    },
    { key: 'sortOrder', label: 'Эрэмбэ', type: 'number' },
    { key: 'active', label: 'Идэвхтэй', type: 'switch' },
  ],
  columns: [
    { key: 'name', label: 'Эмнэлэг', className: 'font-medium' },
    { key: 'phone', label: 'Утас' },
    {
      key: 'services',
      label: 'Үйлчилгээ',
      align: 'center',
      render: (row) => row.services?.length || 0,
    },
    { key: 'sortOrder', label: 'Эрэмбэ', align: 'center' },
    { key: 'active', label: 'Төлөв', render: (row) => <StatusBadge status={row.active ? 'active' : 'cancelled'} /> },
  ],
};

export const coachProgramConfig: ResourceConfig<CoachProgram> = {
  title: 'Коуч хөтөлбөрүүд',
  itemLabel: 'хөтөлбөр',
  idKey: 'id',
  listKey: 'programs',
  itemKey: 'program',
  emptyDefaults: {
    section: 'recommended',
    exerciseCount: 0,
    sortOrder: 0,
    active: true,
  },
  fields: [
    { key: 'id', label: 'ID', type: 'text', required: true },
    { key: 'title', label: 'Гарчиг', type: 'text', required: true },
    { key: 'category', label: 'Ангилал', type: 'text', required: true },
    { key: 'description', label: 'Тайлбар', type: 'textarea', required: true, rows: 3 },
    { key: 'duration', label: 'Хугацаа', type: 'text', placeholder: '6 weeks' },
    { key: 'exerciseCount', label: 'Дасгал тоо', type: 'number' },
    { key: 'imageUrl', label: 'Зураг', type: 'image-upload' },
    { key: 'section', label: 'Хэсэг', type: 'select', options: coachSectionOptions },
    { key: 'sortOrder', label: 'Эрэмбэ', type: 'number' },
    { key: 'active', label: 'Идэвхтэй', type: 'switch' },
  ],
  columns: [
    { key: 'title', label: 'Гарчиг', className: 'font-medium' },
    {
      key: 'section',
      label: 'Хэсэг',
      render: (row) =>
        coachSectionOptions.find((option) => option.value === row.section)?.label ||
        row.section,
    },
    { key: 'category', label: 'Ангилал' },
    { key: 'duration', label: 'Хугацаа', align: 'center' },
    { key: 'active', label: 'Төлөв', render: (row) => <StatusBadge status={row.active ? 'active' : 'cancelled'} /> },
  ],
};

export const promoCodeConfig: ResourceConfig<PromoCode> = {
  title: 'Subscription promo код',
  itemLabel: 'promo код',
  idKey: 'code',
  listKey: 'promoCodes',
  itemKey: 'promoCode',
  emptyDefaults: {
    discountPercent: 10,
    planIds: [],
    usedCount: 0,
    active: true,
  },
  fields: [
    { key: 'code', label: 'Код', type: 'text', required: true },
    { key: 'label', label: 'Тайлбар', type: 'text', required: true },
    { key: 'discountPercent', label: 'Хөнгөлөлт (%)', type: 'number', required: true },
    {
      key: 'planIds',
      label: 'Багц ID-ууд (JSON, хоосон = бүгд)',
      type: 'json',
      rows: 4,
      hint: '["yearly","monthly"]',
    },
    { key: 'maxUses', label: 'Дээд ашиглалт', type: 'number' },
    { key: 'expiresAt', label: 'Дуусах огноо (ISO)', type: 'text' },
    { key: 'active', label: 'Идэвхтэй', type: 'switch' },
  ],
  columns: [
    { key: 'code', label: 'Код', className: 'font-mono font-semibold' },
    { key: 'label', label: 'Тайлбар', className: 'max-w-xs truncate' },
    {
      key: 'discountPercent',
      label: 'Хөнгөлөлт',
      align: 'center',
      render: (row) => `${row.discountPercent}%`,
    },
    {
      key: 'usedCount',
      label: 'Ашигласан',
      align: 'center',
      render: (row) =>
        row.maxUses != null ? `${row.usedCount}/${row.maxUses}` : `${row.usedCount}`,
    },
    { key: 'active', label: 'Төлөв', render: (row) => <StatusBadge status={row.active ? 'active' : 'cancelled'} /> },
  ],
};
