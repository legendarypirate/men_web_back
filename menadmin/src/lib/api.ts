/**
 * Browser API base URL.
 * - Unset NEXT_PUBLIC_API_URL → same-origin `/api` (Next.js proxy, no CORS).
 * - Set NEXT_PUBLIC_API_URL → direct cross-origin calls (backend CORS must allow admin origin).
 */
function resolveApiBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (explicit) return explicit;

  if (typeof window !== 'undefined') {
    return '';
  }

  return (
    process.env.API_PROXY_TARGET?.replace(/\/$/, '') ||
    'http://127.0.0.1:3001'
  );
}

const API_URL = resolveApiBaseUrl();

async function parseApiResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const text = await res.text();
  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    if (res.status === 413) {
      throw new Error(
        'Файлын хэмжээ хэтэрсэн (413). Backend UPLOAD_VIDEO_MAX_MB болон nginx client_max_body_size шалгана уу.'
      );
    }
    if (res.status === 0 || res.type === 'opaque') {
      throw new Error(
        'CORS алдаа: admin болон API өөр domain дээр байна. NEXT_PUBLIC_API_URL-ийг хоослох эсвэл backend CORS_ORIGIN-д admin URL нэмнэ үү.'
      );
    }
    throw new Error(
      text?.slice(0, 120) ||
        `Серверийн алдаа (${res.status}). Network tab-аас бодит статус кодыг шалгана уу.`
    );
  }
}

export type PushNotificationStats = {
  fcmConfigured: boolean;
  registeredDevices: number;
  usersWithTokens: number;
  iosDevices: number;
  androidDevices: number;
};

export type SendPushNotificationPayload = {
  title: string;
  body: string;
  target?: 'all' | 'user';
  userId?: string;
  membership?: string;
  data?: Record<string, string>;
};

export type SendPushNotificationResult = {
  sent: number;
  failed: number;
  recipientCount: number;
  tokenCount: number;
  fcmConfigured: boolean;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  membership: string;
  membershipStartedAt?: string | null;
  membershipExpiresAt?: string | null;
  hasActivePremium?: boolean;
  vitalityScore: number;
  streakDays: number;
  totalSessions: number;
  createdAt: string;
};

export type WorkoutExercisePhase = {
  sortOrder?: number;
  label: string;
  phaseType: string;
  durationSeconds: number;
  vibrationEnabled: boolean;
  vibrationIntervalMs: number;
  holdSeconds?: number;
  relaxSeconds?: number;
  holdIntervalLabel?: string;
  relaxIntervalLabel?: string;
  showInCarousel?: boolean;
};

export type WorkoutIntroSlide = {
  sortOrder?: number;
  title: string;
  subtitle?: string;
  body?: string;
  videoUrl?: string | null;
  imageUrl?: string | null;
  durationSeconds?: number;
  gradientStart?: string;
  gradientMid?: string;
  gradientEnd?: string;
};

export type WorkoutExercise = {
  id?: string;
  name: string;
  category: string;
  instruction: string;
  durationSeconds: number;
  sets: number;
  motion: string;
  motionHint: string;
  targetMuscles?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  sortOrder?: number;
  introSlides?: WorkoutIntroSlide[];
  phases?: WorkoutExercisePhase[];
};

export type SectionTiming = {
  enabled: boolean;
  durationSeconds: number;
  sets: number;
  holdSeconds: number;
  relaxSeconds: number;
  holdIntervalLabel: string;
  relaxIntervalLabel: string;
  vibrationEnabled: boolean;
  vibrationIntervalMs: number;
};

/** Keys "1".."6" — matches app training difficulty levels. */
export type WorkoutLevelPresets = Record<string, SectionTiming[]>;

export type WorkoutProgram = {
  id: string;
  title: string;
  description: string;
  level: string;
  durationMinutes: number;
  equipment?: string | null;
  tag: string;
  isToday: boolean;
  sortOrder: number;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  introSlides?: WorkoutIntroSlide[];
  levelPresets?: WorkoutLevelPresets;
  exercises?: WorkoutExercise[];
};

export type ArticleStorySlide = {
  imageUrl?: string | null;
  accentLine?: string | null;
  line2?: string | null;
  line3?: string | null;
  body?: string | null;
  isCover?: boolean;
};

export type Article = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  body?: string;
  author?: string;
  readMinutes: number;
  tag?: string;
  imageUrl?: string;
  storySlides?: ArticleStorySlide[];
  featured: boolean;
  premium: boolean;
  isNew: boolean;
  sortOrder: number;
  published: boolean;
};

export type HealthBite = {
  id: string;
  title: string;
  body: string;
  icon: string;
  sortOrder: number;
};

export type HomeProTip = {
  id: string;
  text: string;
  actionLabel?: string | null;
  sortOrder: number;
  active: boolean;
};

export type Feedback = {
  id: string;
  userId: string;
  message: string;
  status: 'new' | 'reviewed' | 'resolved';
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
};

export type PremiumPlan = {
  id: string;
  title: string;
  amountMnt: number;
  periodLabel: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
  saveText?: string;
  buttonLabel: string;
  useInfinity: boolean;
  sortOrder: number;
};

export type PaymentSettings = {
  qpayEnabled: boolean;
  emailLoginEnabled: boolean;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  transferNote: string;
};

export type Payment = {
  id: string;
  invoiceId: string;
  amountMnt: number;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  planId: string;
  createdAt: string;
  user?: { id: string; name: string; email: string };
  plan?: PremiumPlan;
};

export type Stats = {
  users: number;
  premiumUsers: number;
  sessions: number;
  articles: number;
  programs: number;
  payments: number;
  pendingPayments: number;
  paidRevenue: number;
  paidRevenueLabel: string;
  products: number;
  orders: number;
  pendingOrders: number;
  orderRevenue: number;
  orderRevenueLabel: string;
  assessmentQuestions: number;
  hospitals: number;
  coachPrograms: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  priceMnt: number;
  category: 'supplements' | 'devices' | 'wellness' | 'nutrition';
  icon: string;
  gradientStart: string;
  gradientEnd: string;
  images: string[];
  benefits: string[];
  detailSections?: ProductDetailSection[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
  badge?: string;
  sortOrder: number;
  active: boolean;
};

export type ProductDetailSection = {
  title: string;
  description: string;
  dosage?: string;
  ingredients?: string;
  sortOrder?: number;
};

export type HospitalDoctor = {
  id: string;
  name: string;
  specialty: string;
  experienceYears?: number;
  bio?: string;
};

export type HospitalService = {
  id: string;
  name: string;
  priceMnt: number;
  category?: string;
  doctorId?: string;
  description?: string;
};

export type Hospital = {
  id: string;
  name: string;
  address: string;
  phone: string;
  imageUrl?: string;
  openHours?: string;
  description: string;
  tags: string[];
  categoryIds: string[];
  doctors: HospitalDoctor[];
  services: HospitalService[];
  sortOrder: number;
  active: boolean;
};

export type HospitalCategoryRecord = {
  id: string;
  title: string;
  description: string;
  icon: string;
  sortOrder: number;
  active: boolean;
};

export type ArticleCategoryRecord = {
  id: string;
  name: string;
  sortOrder: number;
};

export type CoachSetting = {
  id: string;
  screenTitle: string;
  bannerTitle: string;
  bannerSubtitle: string;
  coachName: string;
  coachRole: string;
  coachImageUrl?: string;
  learnMoreLabel: string;
  active: boolean;
};

export type PromoCode = {
  code: string;
  label: string;
  discountPercent: number;
  coachProgramId?: string;
  planIds: string[];
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;
};

export type CoachProgram = {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  exerciseCount: number;
  imageUrl?: string;
  section: 'main' | 'recommended' | 'courses';
  sortOrder: number;
  active: boolean;
};

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceMnt: number;
  lineTotalMnt: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId?: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalMnt: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress?: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  items?: OrderItem[];
  user?: { id: string; name: string; email: string };
};

export type WorkoutSession = {
  id: string;
  userId: string;
  programId: string;
  durationSeconds: number;
  calories: number;
  completedSets: number;
  consistencyPercent: number;
  createdAt: string;
  user?: { id: string; name: string; email: string };
  program?: { id: string; title: string };
};

export type AssessmentQuestion = {
  id: string;
  step: number;
  totalSteps: number;
  questionKey: string;
  title: string;
  helpText?: string;
  options: Array<{ key: string; title: string; description?: string; icon?: string }>;
  sortOrder: number;
  active: boolean;
};

export type AssessmentAnswerRow = {
  id: string;
  userId: string;
  step: number;
  questionKey: string;
  answerKey: string;
  answerLabel?: string;
  createdAt: string;
  user?: { id: string; name: string; email: string };
};

export type QuizEndMediaItem = {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string;
  caption?: string;
  sortOrder?: number;
};

export type QuizStageRecord = {
  id: number;
  label: string;
  sortOrder: number;
  active: boolean;
  endMediaType: 'none' | 'image' | 'video';
  endMediaUrl?: string | null;
  endMediaTitle?: string | null;
  endMediaCaption?: string | null;
  endMediaItems?: QuizEndMediaItem[];
};

export type QuizQuestionRecord = {
  id: string;
  stageId: number;
  title: string;
  options: Array<{ id: string; label: string }>;
  sortOrder: number;
  active: boolean;
};

export type QuizConfigRecord = {
  id: string;
  processingTitle: string;
  processingMessages: string[];
  active: boolean;
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export function setToken(token: string) {
  localStorage.setItem('admin_token', token);
}

export function clearToken() {
  localStorage.removeItem('admin_token');
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export type UploadResult = {
  url: string;
  publicId: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  bytes?: number;
};

async function uploadMultipart(
  path: string,
  field: string,
  file: File
): Promise<UploadResult> {
  const form = new FormData();
  form.append(field, file);
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const json = await parseApiResponse<UploadResult>(res);
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Файл байршуулахад алдаа');
  }
  return json.data;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json = await parseApiResponse<T>(res);
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Алдаа гарлаа');
  }
  return json;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<{ user: User }>('/api/admin/me'),

  stats: () => request<Stats>('/api/admin/stats'),

  upload: {
    image: (file: File) => uploadMultipart('/api/admin/upload/image', 'image', file),
    video: (file: File) => uploadMultipart('/api/admin/upload/video', 'video', file),
  },

  users: {
    list: () => request<{ users: User[] }>('/api/admin/users'),
    update: (id: string, data: Partial<User>) =>
      request<{ user: User }>(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<null>(`/api/admin/users/${id}`, { method: 'DELETE' }),
  },

  workouts: {
    list: (tag?: string) =>
      request<{ programs: WorkoutProgram[] }>(
        tag ? `/api/admin/workouts?tag=${encodeURIComponent(tag)}` : '/api/admin/workouts'
      ),
    create: (data: Partial<WorkoutProgram> & { exercises?: WorkoutExercise[] }) =>
      request<{ program: WorkoutProgram }>('/api/admin/workouts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<WorkoutProgram> & { exercises?: WorkoutExercise[] }) =>
      request<{ program: WorkoutProgram }>(`/api/admin/workouts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<null>(`/api/admin/workouts/${id}`, { method: 'DELETE' }),
    uploadVideo: async (file: File) => {
      const result = await uploadMultipart('/api/admin/upload/video', 'video', file);
      return result.url;
    },
    uploadVideoWithMeta: (file: File) =>
      uploadMultipart('/api/admin/upload/video', 'video', file),
    uploadImage: (file: File) => uploadMultipart('/api/admin/upload/image', 'image', file),
  },

  articleCategories: {
    list: () =>
      request<{ categories: ArticleCategoryRecord[] }>('/api/admin/article-categories'),
    create: (data: { name: string; sortOrder?: number }) =>
      request<{ category: ArticleCategoryRecord }>('/api/admin/article-categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<null>(`/api/admin/article-categories/${id}`, { method: 'DELETE' }),
    removeByName: (name: string) =>
      request<null>(
        `/api/admin/article-categories/by-name/${encodeURIComponent(name)}`,
        { method: 'DELETE' }
      ),
    reorder: (data: { names: string[] }) =>
      request<{ categories: ArticleCategoryRecord[] }>(
        '/api/admin/article-categories/reorder',
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      ),
  },

  articles: {
    list: () => request<{ articles: Article[] }>('/api/admin/articles'),
    create: (data: Partial<Article>) =>
      request<{ article: Article }>('/api/admin/articles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Article>) =>
      request<{ article: Article }>(`/api/admin/articles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<null>(`/api/admin/articles/${id}`, { method: 'DELETE' }),
  },

  healthBites: {
    list: () => request<{ healthBites: HealthBite[] }>('/api/admin/health-bites'),
    create: (data: Partial<HealthBite>) =>
      request<{ healthBite: HealthBite }>('/api/admin/health-bites', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<HealthBite>) =>
      request<{ healthBite: HealthBite }>(`/api/admin/health-bites/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<null>(`/api/admin/health-bites/${id}`, { method: 'DELETE' }),
  },

  homeProTips: {
    list: () => request<{ proTips: HomeProTip[] }>('/api/admin/home-pro-tips'),
    create: (data: Partial<HomeProTip>) =>
      request<{ proTip: HomeProTip }>('/api/admin/home-pro-tips', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<HomeProTip>) =>
      request<{ proTip: HomeProTip }>(`/api/admin/home-pro-tips/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<null>(`/api/admin/home-pro-tips/${id}`, { method: 'DELETE' }),
  },

  plans: {
    list: () => request<{ plans: PremiumPlan[] }>('/api/admin/plans'),
    create: (data: Partial<PremiumPlan>) =>
      request<{ plan: PremiumPlan }>('/api/admin/plans', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<PremiumPlan>) =>
      request<{ plan: PremiumPlan }>(`/api/admin/plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<null>(`/api/admin/plans/${id}`, { method: 'DELETE' }),
  },

  payments: {
    list: () => request<{ payments: Payment[] }>('/api/admin/payments'),
    updateStatus: (id: string, status: Payment['status']) =>
      request<{ payment: Payment }>(`/api/admin/payments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  products: {
    list: () => request<{ products: Product[] }>('/api/admin/products'),
    create: (data: Partial<Product>) =>
      request<{ product: Product }>('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Product>) =>
      request<{ product: Product }>(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<null>(`/api/admin/products/${id}`, { method: 'DELETE' }),
  },

  orders: {
    list: () => request<{ orders: Order[] }>('/api/admin/orders'),
    update: (id: string, data: { status?: Order['status']; notes?: string }) =>
      request<{ order: Order }>(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  sessions: {
    list: () => request<{ sessions: WorkoutSession[] }>('/api/admin/sessions'),
  },

  assessmentQuestions: {
    list: () =>
      request<{ questions: AssessmentQuestion[] }>('/api/admin/assessment-questions'),
    create: (data: Partial<AssessmentQuestion>) =>
      request<{ question: AssessmentQuestion }>('/api/admin/assessment-questions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<AssessmentQuestion>) =>
      request<{ question: AssessmentQuestion }>(`/api/admin/assessment-questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<null>(`/api/admin/assessment-questions/${id}`, { method: 'DELETE' }),
  },

  assessmentAnswers: {
    list: () =>
      request<{ answers: AssessmentAnswerRow[] }>('/api/admin/assessment-answers'),
  },

  settings: {
    getPayment: () =>
      request<{ settings: PaymentSettings }>('/api/admin/settings/payment'),
    updatePayment: (data: Partial<PaymentSettings>) =>
      request<{ settings: PaymentSettings }>('/api/admin/settings/payment', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  hospitalCategories: {
    list: () =>
      request<{ categories: HospitalCategoryRecord[] }>('/api/admin/hospital-categories'),
    create: (data: Partial<HospitalCategoryRecord>) =>
      request<{ category: HospitalCategoryRecord }>('/api/admin/hospital-categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<HospitalCategoryRecord>) =>
      request<{ category: HospitalCategoryRecord }>(`/api/admin/hospital-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<null>(`/api/admin/hospital-categories/${id}`, { method: 'DELETE' }),
  },

  hospitals: {
    list: () => request<{ hospitals: Hospital[] }>('/api/admin/hospitals'),
    create: (data: Partial<Hospital>) =>
      request<{ hospital: Hospital }>('/api/admin/hospitals', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Hospital>) =>
      request<{ hospital: Hospital }>(`/api/admin/hospitals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<null>(`/api/admin/hospitals/${id}`, { method: 'DELETE' }),
  },

  coach: {
    getSettings: () =>
      request<{ settings: CoachSetting }>('/api/admin/coach/settings'),
    updateSettings: (data: Partial<CoachSetting>) =>
      request<{ settings: CoachSetting }>('/api/admin/coach/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    listPrograms: () =>
      request<{ programs: CoachProgram[] }>('/api/admin/coach/programs'),
    createProgram: (data: Partial<CoachProgram>) =>
      request<{ program: CoachProgram }>('/api/admin/coach/programs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateProgram: (id: string, data: Partial<CoachProgram>) =>
      request<{ program: CoachProgram }>(`/api/admin/coach/programs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    removeProgram: (id: string) =>
      request<null>(`/api/admin/coach/programs/${id}`, { method: 'DELETE' }),
  },

  promoCodes: {
    list: () => request<{ promoCodes: PromoCode[] }>('/api/admin/promo-codes'),
    create: (data: Partial<PromoCode>) =>
      request<{ promoCode: PromoCode }>('/api/admin/promo-codes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (code: string, data: Partial<PromoCode>) =>
      request<{ promoCode: PromoCode }>(`/api/admin/promo-codes/${code}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (code: string) =>
      request<null>(`/api/admin/promo-codes/${code}`, { method: 'DELETE' }),
  },

  feedback: {
    list: () => request<{ feedback: Feedback[] }>('/api/admin/feedback'),
    update: (id: string, data: Partial<Feedback>) =>
      request<{ feedback: Feedback }>(`/api/admin/feedback/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<null>(`/api/admin/feedback/${id}`, { method: 'DELETE' }),
  },

  notifications: {
    stats: () => request<PushNotificationStats>('/api/admin/notifications/stats'),
    send: (data: SendPushNotificationPayload) =>
      request<SendPushNotificationResult>('/api/admin/notifications/send', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  quizStages: {
    list: () => request<{ stages: QuizStageRecord[] }>('/api/admin/quiz/stages'),
    create: (data: Partial<QuizStageRecord>) =>
      request<{ stage: QuizStageRecord }>('/api/admin/quiz/stages', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<QuizStageRecord>) =>
      request<{ stage: QuizStageRecord }>(`/api/admin/quiz/stages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<null>(`/api/admin/quiz/stages/${id}`, { method: 'DELETE' }),
  },

  quizQuestions: {
    list: () =>
      request<{ questions: QuizQuestionRecord[] }>('/api/admin/quiz/questions'),
    create: (data: Partial<QuizQuestionRecord>) =>
      request<{ question: QuizQuestionRecord }>('/api/admin/quiz/questions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<QuizQuestionRecord>) =>
      request<{ question: QuizQuestionRecord }>(`/api/admin/quiz/questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      request<null>(`/api/admin/quiz/questions/${id}`, { method: 'DELETE' }),
  },

  quizConfig: {
    get: () => request<{ config: QuizConfigRecord }>('/api/admin/quiz/config'),
    update: (data: Partial<QuizConfigRecord>) =>
      request<{ config: QuizConfigRecord }>('/api/admin/quiz/config', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
};

export function formatMnt(value: number) {
  return `${Number(value).toLocaleString('en-US')}₮`;
}
