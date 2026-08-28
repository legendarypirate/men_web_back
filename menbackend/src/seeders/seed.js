require('../config/env');
const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  WorkoutProgram,
  WorkoutExercise,
  Article,
  HealthBite,
  PremiumPlan,
  Product,
  Order,
  OrderItem,
  AssessmentQuestion,
  PaymentSettings,
  Hospital,
  HospitalCategory,
  CoachSetting,
  CoachProgram,
  PromoCode,
  HomeProTip,
} = require('../models');
const {
  defaultPhasesForMotion,
  kegelHoldSequence,
  breathPhases,
  coreBracePhases,
} = require('../data/exercisePhases');
const {
  hospitals,
  hospitalCategories,
  coachSetting,
  coachPrograms,
  kegelDetailSections,
  promoCodes,
  homeProTips,
} = require('../data/seedContent');

const programs = [
  {
    id: 'metabolic_primer',
    title: 'Бүх биеийн бодисын солилцоог идэвхжүүлэгч',
    description:
      'Гормоны хариу урвалыг дээд зэргээр нэмэгдүүлэхийн тулд огцом хөдөлгөөн болон хяналттай сунгалтын дасгалуудад анхаарлаа хандуулаарай.',
    level: 'Ахисан түвшин',
    durationMinutes: 12,
    tag: 'ӨНӨӨДРИЙН ДАСГАЛ',
    isToday: true,
    sortOrder: 0,
    exercises: [
      {
        name: 'Кегелийн барих',
        category: 'ААРЦГИЙН ЁРООЛ',
        instruction:
          'Зөв хэлбэрээ хадгал. Амьсгал болон хэвлийн булчингийн ажиллахдаа анхаарлаа хандуул.',
        durationSeconds: 40,
        sets: 4,
        motion: 'kegelHold',
        motionHint: 'Аарцгийн булчингаа чангалж барь',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: null,
        phases: kegelHoldSequence('Кегелийн барих', {
          holdBlockSec: 25,
          relaxTabSec: 15,
          innerHoldSec: 5,
          innerRelaxSec: 5,
        }),
      },
      {
        name: 'Гүн амьсгал',
        category: 'СЭРГЭЭЛТ',
        instruction:
          'Хамраараа гүн амьсгаа аваад амаараа удаан гарга. Мөрөө тайван байлга.',
        durationSeconds: 30,
        sets: 3,
        motion: 'breath',
        motionHint: 'Цээжээ өргөж гүн амьсгал',
        phases: breathPhases(5, 10),
      },
      {
        name: 'Гол булчингийн идэвхжүүлэлт',
        category: 'ГОЛ БУЛЧИН',
        instruction:
          'Хэвлийн булчингаа чангалж, нуруугаа шулуун байлга. Амьсгалаа бүү барь.',
        durationSeconds: 35,
        sets: 3,
        motion: 'coreBrace',
        motionHint: 'Хэвлийгээ чангалж тогтворжуул',
        phases: coreBracePhases(),
      },
      {
        name: 'Суниалт',
        category: 'ЦЭЭЖ БА ГУРВАН ТОЛГОЙТ БУЛЧИН',
        instruction:
          'Зөв хэлбэрээ хадгал. Амьсгал болон хэвлийн булчингийн ажиллахдаа анхаарлаа хандуул.',
        durationSeconds: 40,
        sets: 4,
        motion: 'pushup',
        motionHint: 'Биеэ доошлуулж дээшлүүл',
      },
    ],
  },
  {
    id: 'pelvic_foundation',
    title: 'Аарцгийн ёроолын суурь',
    description:
      'Эхлэгчдэд зориулсан аарцгийн ёроолын булчингийн үндсэн бэхжүүлэлт.',
    level: 'Эхлэгч',
    durationMinutes: 8,
    tag: 'СУУРЬ',
    isToday: false,
    sortOrder: 1,
    exercises: [
      {
        name: 'Зөөлөн барих',
        category: 'ААРЦГИЙН ЁРООЛ',
        instruction: 'Булчингаа зөөлөн чангалж, 5 секунд барь.',
        durationSeconds: 25,
        sets: 3,
        motion: 'kegelHold',
        motionHint: 'Зөөлөн чангалж барь',
      },
      {
        name: 'Хэмнэлтэй агшилт',
        category: 'ААРЦГИЙН ЁРООЛ',
        instruction: 'Хурдан агшилт, тайвшруулалтыг ээлжлэн хий.',
        durationSeconds: 30,
        sets: 3,
        motion: 'pulse',
        motionHint: 'Хурдан агшилт ↔ тайвшруулалт',
      },
      {
        name: 'Тайвшруулах амьсгал',
        category: 'СЭРГЭЭЛТ',
        instruction: 'Бүх биеэ тайвшруулж, гүн амьсгал.',
        durationSeconds: 20,
        sets: 2,
        motion: 'breath',
        motionHint: 'Гүн амьсгалж тайвшруул',
      },
    ],
  },
  {
    id: 'bladder_control',
    title: 'Давсагны хяналт',
    description:
      'Яаралтай байдал болон давтамжийг бууруулахад чиглэсэн дасгалууд.',
    level: 'Дунд',
    durationMinutes: 10,
    tag: 'ЗОРИЛТОТ',
    isToday: false,
    sortOrder: 2,
    exercises: [
      {
        name: 'Урт барих',
        category: 'ДАВСАГНЫ ХЯНАЛТ',
        instruction: 'Булчингаа чангалж, тогтвортой барь.',
        durationSeconds: 45,
        sets: 3,
        motion: 'endurance',
        motionHint: 'Удаан, тогтвортой барь',
      },
      {
        name: 'Давтамжит агшилт',
        category: 'ДАВСАГНЫ ХЯНАЛТ',
        instruction: 'Богино агшилтыг хэмнэлтэй хий.',
        durationSeconds: 30,
        sets: 4,
        motion: 'pulse',
        motionHint: 'Богино агшилтыг давтана',
      },
      {
        name: 'Гол тогтворжилт',
        category: 'ГОЛ БУЛЧИН',
        instruction: 'Хэвлий болон аарцгийн булчингаа хамт ажиллуул.',
        durationSeconds: 35,
        sets: 3,
        motion: 'coreBrace',
        motionHint: 'Хэвлий + аарцгийг хамт чангал',
      },
    ],
  },
  {
    id: 'performance_boost',
    title: 'Гүйцэтгэл нэмэгдүүлэх',
    description:
      'Бэлгийн эрүүл мэнд болон гүйцэтгэлийг сайжруулах ахисан түвшний хөтөлбөр.',
    level: 'Ахисан түвшин',
    durationMinutes: 15,
    tag: 'ГҮЙЦЭТГЭЛ',
    isToday: false,
    sortOrder: 3,
    exercises: [
      {
        name: 'Хүчтэй барих',
        category: 'ААРЦГИЙН ЁРООЛ',
        instruction: 'Хамгийн их хүчээр барьж, удаан тайвшруул.',
        durationSeconds: 50,
        sets: 4,
        motion: 'kegelHold',
        motionHint: 'Хамгийн хүчтэйгээр барь',
      },
      {
        name: 'Долгионт агшилт',
        category: 'ААРЦГИЙН ЁРООЛ',
        instruction: 'Агшилтын хүчийг аажмаар нэмэгдүүл.',
        durationSeconds: 40,
        sets: 3,
        motion: 'wave',
        motionHint: 'Хүчийг аажмаар нэмэгдүүл',
      },
      {
        name: 'Тэсвэр тэвчээр',
        category: 'ТЭСВЭР',
        instruction: 'Урт хугацаанд тогтвортой барих чадварыг хөгжүүл.',
        durationSeconds: 60,
        sets: 3,
        motion: 'endurance',
        motionHint: 'Урт хугацаанд барьж тэсвэрлэ',
      },
      {
        name: 'Сэргээлтийн амьсгал',
        category: 'СЭРГЭЭЛТ',
        instruction: 'Дасгалын дараа булчингаа бүрэн тайвшруул.',
        durationSeconds: 30,
        sets: 2,
        motion: 'breath',
        motionHint: 'Амьсгалж булчингаа тайвшруул',
      },
    ],
  },
  {
    id: 'pelvic_stretching_pro',
    title: 'Pelvic Stretching Pro',
    description:
      'Promotes flexibility and relaxation in the pelvic area, reducing muscle fatigue and overactivity',
    level: 'Advanced',
    durationMinutes: 17,
    tag: 'PELVIC STRETCHING',
    isToday: false,
    sortOrder: 10,
    videoUrl: null,
    thumbnailUrl: null,
    exercises: [
      {
        name: 'Warrior II',
        category: 'ХОНГО БА ААРЦАГ',
        instruction: 'Хөлөө мөрнөөс өргөн тавьж сунгалт хийнэ.',
        durationSeconds: 80,
        sets: 1,
        motion: 'coreBrace',
        motionHint: 'Урагш чиглэн тогтвортой байрлал хадгал',
      },
      {
        name: 'Legs on the wall',
        category: 'ЦУСНЫ ЭРГЭЛТ БА ТАЙВШРАЛ',
        instruction: 'Хөлөө хана дагуулан дээш өргөнө.',
        durationSeconds: 123,
        sets: 1,
        motion: 'breath',
        motionHint: 'Гүн амьсгалж хэвлийн хэсгийг бүрэн сулла',
      },
    ],
  },
];

async function seed() {
  await sequelize.sync({ force: true });
  console.log('Database synced (force)');

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('user12', 10);

  const demoUser = await User.create({
    email: 'admin@tenkhee.mn',
    passwordHash: adminHash,
    name: 'Tenkhee Админ',
    role: 'admin',
    membership: 'platinum',
    darkMode: true,
    language: 'mn',
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  DEMO ADMIN LOGIN');
  console.log('  Email:    admin@tenkhee.mn');
  console.log('  Password: user12');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const demoAppUser = await User.create({
    email: 'demo@tenkhee.mn',
    passwordHash,
    name: 'Доктор Жеймс Стерлинг',
    membership: 'platinum',
    vitalityScore: 88,
    activeDays: 242,
    streakDays: 5,
    longestStreak: 18,
    totalSessions: 124,
    avgHoldSeconds: 102,
    primaryGoal: 'bladder_control',
    darkMode: true,
    language: 'mn',
  });
  console.log('Demo app user: demo@tenkhee.mn / password123');

  const tetHash = await bcrypt.hash('user12', 10);
  await User.create({
    email: 'tet@gmail.com',
    passwordHash: tetHash,
    name: 'Demo User',
    provider: 'email',
    membership: 'free',
    language: 'mn',
  });
  console.log('Demo app user: tet@gmail.com / user12');

  for (const program of programs) {
    const { exercises, ...programData } = program;
    await WorkoutProgram.create(programData);
    for (let i = 0; i < exercises.length; i++) {
      await WorkoutExercise.create({
        ...exercises[i],
        phases:
          exercises[i].phases ??
          defaultPhasesForMotion(exercises[i].motion),
        programId: program.id,
        sortOrder: i,
      });
    }
  }
  console.log(`Seeded ${programs.length} workout programs`);

  await PremiumPlan.bulkCreate([
    {
      id: 'monthly',
      title: 'Сар бүр',
      amountMnt: 99000,
      periodLabel: '/сар',
      features: ['Уян хатан хандалт', 'Бүх үндсэн функцүүд'],
      highlighted: false,
      buttonLabel: 'Сонгох',
      sortOrder: 0,
    },
    {
      id: 'yearly',
      title: 'Жил бүр',
      amountMnt: 699000,
      periodLabel: '/жил',
      features: [
        'Тэргүүн ээлжийн дэмжлэг',
        'Улирлын гүйцэтгэлийн багцууд',
        'Ахисан түвшний гормоны хяналт',
      ],
      highlighted: true,
      badge: 'Хамгийн ашигтай',
      saveText: 'САР БҮРИЙН ТӨЛБӨРӨӨС 45% ХЭМНЭНЭ',
      buttonLabel: 'Жилээр сонгох',
      sortOrder: 1,
    },
    {
      id: 'lifetime',
      title: 'Насан туршдаа',
      amountMnt: 1999000,
      periodLabel: 'нэг удаа',
      features: ['Үүрд хандах эрх', 'Нэг удаагийн төлбөр'],
      highlighted: false,
      useInfinity: true,
      buttonLabel: 'Сонгох',
      sortOrder: 2,
    },
  ]);
  console.log('Seeded premium plans');

  await Article.bulkCreate([
    {
      category: 'Сэргээлт',
      title: 'Урт наслалтад зориулсан гүн сэргээлтийн шинжлэх ухаан',
      excerpt: 'Гүн сэргээлт болон урт наслалтын холбоо.',
      author: 'Доктор Жулиен Торн',
      readMinutes: 8,
      tag: 'ГҮЙЦЭТГЭЛИЙН АХИСАН ТҮВШИН',
      featured: true,
    },
    {
      category: 'Хоол тэжээл',
      title: 'Төвлөрлийг хадгалах өглөөний цайны хамгийн тохиромжтой макро шим тэжээл',
      excerpt:
        'Өглөөний уураг, өөх тосны тодорхой харьцаа нь инсулиныг хэрхэн тогтворжуулж, танин мэдэхүйг сайжруулдгийг мэдэж аваарай...',
      readMinutes: 5,
      tag: 'Хоол тэжээл',
    },
    {
      category: 'Шинжлэх ухаан',
      title: 'VO2 Max-ийг эрүүл мэндийн үзүүлэлт болгон ойлгох нь',
      excerpt:
        'Шинэ судалгаагаар таны зүрх судасны үйл ажиллагаа нь хамгийн чухал үзүүлэлт болохыг харуулж байна...',
      readMinutes: 12,
      tag: 'Шинжлэх ухаан',
    },
    {
      category: 'Сэргээлт',
      title: 'Оновчлол: Магнийн глицинат',
      excerpt:
        'Магнийн энэ төрөл нь булчингийн нөхөн сэргээлт болон нойрны чанарт яагаад илүү сайн болохыг олж мэдээрэй.',
      readMinutes: 6,
      tag: 'СЭРГЭЭЛТ',
    },
    {
      category: 'Шинжлэх ухаан',
      title: 'Өөрийн HRV хандлагыг ойлгох нь',
      excerpt:
        'Таны зүрхний цохилтын хэлбэлзэл (HRV) энэ долоо хоногт 15%-иар өссөн байна.',
      readMinutes: 7,
      tag: 'МЭДЭЭЛЛИЙН ДҮН ШИНЖИЛГЭЭ',
    },
  ]);
  console.log('Seeded articles');

  await HealthBite.bulkCreate([
    {
      title: 'Шингэн нөхөх логик',
      body: 'Биеийн жингийн кг тутамд 35 мл, дээр нь эрчимтэй бэлтгэлийн цаг тутамд 500 мл шингэн уухыг зорино уу.',
      icon: 'water_drop',
      sortOrder: 0,
    },
    {
      title: '90 минутын дүрэм',
      body: 'Өглөө илүү сэргэг байхын тулд REM нойрны дундуур сэрэхээс сэргийлж, унтах мөчлөгөө тааруулаарай.',
      icon: 'nightlight',
      sortOrder: 1,
    },
  ]);
  console.log('Seeded health bites');

  await HomeProTip.bulkCreate(homeProTips);
  console.log('Seeded home pro tips');

  await Product.bulkCreate([
    {
      id: 'mag-glycinate',
      name: 'Магнийн глицинат 400мг',
      description:
        'Булчингийн нөхөн сэргээлт, нойрны чанар, стрессийн менежментэд зориулсан өндөр шингэх чадвартай магнийн нөхцөл.',
      priceMnt: 89000,
      category: 'supplements',
      icon: 'bedtime',
      gradientStart: '#0F766E',
      gradientEnd: '#14B8A6',
      images: [
        'https://picsum.photos/seed/tenkhee-mag-glycinate-1/800/800',
        'https://picsum.photos/seed/tenkhee-mag-glycinate-2/800/800',
        'https://picsum.photos/seed/tenkhee-mag-glycinate-3/800/800',
      ],
      benefits: ['Нойрны чанарыг сайжруулна', 'Булчингийн сэргээлтийг дэмжинэ', 'Стрессийн түвшинг бууруулна'],
      rating: 4.8,
      reviewCount: 342,
      featured: true,
      badge: 'Онцлох',
      sortOrder: 0,
    },
    {
      id: 'kegel-trainer',
      name: 'VitalKegel Pro сургалтын төхөөрөмж',
      description:
        'Аарцгийн ёроолын булчинг бэхжүүлэх био-feedback-тэй ухаалаг сургалтын төхөөрөмж.',
      priceMnt: 249000,
      category: 'devices',
      icon: 'fitness_center',
      gradientStart: '#1E3A5F',
      gradientEnd: '#2563EB',
      images: [
        'https://picsum.photos/seed/tenkhee-kegel-trainer-1/800/800',
        'https://picsum.photos/seed/tenkhee-kegel-trainer-2/800/800',
      ],
      benefits: ['Био-feedback хяналт', 'App интеграци', 'Эмчээр баталгаажсан'],
      detailSections: kegelDetailSections,
      rating: 4.9,
      reviewCount: 128,
      featured: true,
      badge: 'Шилдэг борлуулалт',
      sortOrder: 1,
    },
    {
      id: 'testo-support',
      name: 'Эрчим хүчний дэмжлэг капсул',
      description: 'Цинк, D3 витамин, ashwagandha-г агуулсан эрчүүдэд зориулсан өдөр тутмын нөхцөл.',
      priceMnt: 119000,
      category: 'supplements',
      icon: 'bolt',
      gradientStart: '#92400E',
      gradientEnd: '#F59E0B',
      images: [
        'https://picsum.photos/seed/tenkhee-testo-support-1/800/800',
        'https://picsum.photos/seed/tenkhee-testo-support-2/800/800',
        'https://picsum.photos/seed/tenkhee-testo-support-3/800/800',
      ],
      benefits: ['Эрчим хүчийг нэмэгдүүлнэ', 'Гормоны тэнцвэрийг дэмжинэ', '90 хоногийн хөтөлбөр'],
      rating: 4.6,
      reviewCount: 215,
      sortOrder: 2,
    },
    {
      id: 'prostate-formula',
      name: 'Простат эрүүл мэндийн томилол',
      description: 'Saw palmetto, lycopene, цинк агуулсан эрчүүдийн урт наслалтын эрүүл мэндэд зориулсан томилол.',
      priceMnt: 99000,
      category: 'wellness',
      icon: 'shield',
      gradientStart: '#166534',
      gradientEnd: '#22C55E',
      images: [
        'https://picsum.photos/seed/tenkhee-prostate-formula-1/800/800',
        'https://picsum.photos/seed/tenkhee-prostate-formula-2/800/800',
      ],
      benefits: ['Простат эрүүл мэндийг дэмжинэ', '40+ насны эрчүүдэд', 'GMP баталгаажсан'],
      rating: 4.7,
      reviewCount: 189,
      sortOrder: 3,
    },
    {
      id: 'sleep-recovery',
      name: 'Гүн нойрны сэргээлт',
      description: 'L-theanine, melatonin, magnesium blend — сэргэлтийн чанар, HRV сайжруулалтад зориулсан.',
      priceMnt: 79000,
      category: 'wellness',
      icon: 'nightlight',
      gradientStart: '#312E81',
      gradientEnd: '#6366F1',
      images: [
        'https://picsum.photos/seed/tenkhee-sleep-recovery-1/800/800',
        'https://picsum.photos/seed/tenkhee-sleep-recovery-2/800/800',
      ],
      benefits: ['REM нойрыг дэмжинэ', 'HRV сайжруулна', 'Өглөө сэргэлтэй'],
      rating: 4.5,
      reviewCount: 276,
      sortOrder: 4,
    },
    {
      id: 'omega3-men',
      name: 'Omega-3 Ultra эрчүүдэд',
      description: 'EPA/DHA өндөр агуулгатай зүрх судас, тархины функц, үе мөчний эрүүл мэндэд зориулсан.',
      priceMnt: 85000,
      category: 'nutrition',
      icon: 'water_drop',
      gradientStart: '#0C4A6E',
      gradientEnd: '#0EA5E9',
      images: [
        'https://picsum.photos/seed/tenkhee-omega3-men-1/800/800',
        'https://picsum.photos/seed/tenkhee-omega3-men-2/800/800',
        'https://picsum.photos/seed/tenkhee-omega3-men-3/800/800',
      ],
      benefits: ['Зүрхний эрүүл мэнд', 'Тархины функц', '60 капсул'],
      rating: 4.4,
      reviewCount: 401,
      sortOrder: 5,
    },
    {
      id: 'protein-recovery',
      name: 'Сэргээлтийн уураг 2кг',
      description: 'Whey isolate, BCAA, creatine — бэлтгэлийн дараах булчингийн нөхөн сэргээлтэд зориулсан.',
      priceMnt: 159000,
      category: 'nutrition',
      icon: 'local_drink',
      gradientStart: '#7C2D12',
      gradientEnd: '#EA580C',
      images: [
        'https://picsum.photos/seed/tenkhee-protein-recovery-1/800/800',
        'https://picsum.photos/seed/tenkhee-protein-recovery-2/800/800',
      ],
      benefits: ['25г уураг/анги', 'BCAA + creatine', 'Шоколад амт'],
      rating: 4.6,
      reviewCount: 523,
      sortOrder: 6,
    },
    {
      id: 'tens-massager',
      name: 'TENS массажны төхөөрөмж',
      description: 'Булчингийн хатуурал, сэргээлтийн үед ашиглах зөөлөн цахилгаан стимуляци.',
      priceMnt: 189000,
      category: 'devices',
      icon: 'electrical_services',
      gradientStart: '#374151',
      gradientEnd: '#6B7280',
      images: [
        'https://picsum.photos/seed/tenkhee-tens-massager-1/800/800',
        'https://picsum.photos/seed/tenkhee-tens-massager-2/800/800',
        'https://picsum.photos/seed/tenkhee-tens-massager-3/800/800',
      ],
      benefits: ['6 массажны горим', 'Утасгүй, 8 цаг ажиллана', 'Эмчийн зөвлөмжтэй'],
      rating: 4.3,
      reviewCount: 97,
      sortOrder: 7,
    },
  ]);
  console.log('Seeded 8 shop products');

  await AssessmentQuestion.bulkCreate([
    {
      id: 'primary_goal',
      step: 4,
      totalSteps: 9,
      questionKey: 'primary_goal',
      title: 'Таны үндсэн зорилго юу вэ?',
      helpText: 'Бид таны эмнэлзүйн чиглэлд үндэслэн өдөр тутмын бэлтгэлийн дэглэмийг тохируулна.',
      options: [
        { key: 'bladder_control', title: 'Давсагны хяналтыг сайжруулах', description: 'Яаралтай байдал болон давтамжийг бууруулах.', icon: 'water_drop' },
        { key: 'sexual_health', title: 'Бэлгийн эрүүл мэндийг сайжруулах', description: 'Гүйцэтгэл болон сэргээлтийг нэмэгдүүлэх.', icon: 'favorite' },
        { key: 'pelvic_floor', title: 'Аарцгийн ёроолыг бэхжүүлэх', description: 'Мэс заслын дараа эсвэл гол дэмжлэг.', icon: 'fitness_center' },
        { key: 'general_health', title: 'Ерөнхий эрүүл мэнд', description: 'Урт хугацааны эрэгтэйчүүдийн эрүүл мэндийг хадгалах.', icon: 'bolt' },
      ],
      sortOrder: 0,
    },
    {
      id: 'urgency',
      step: 4,
      totalSteps: 9,
      questionKey: 'urgency',
      title: 'Танд шээс яаралтай хүрэх тохиолдол хэр их гардаг вэ?',
      helpText: 'Энэ нь таны шээс ялгаруулах доод замын эрүүл мэндийн байдлыг ойлгоход тусална.',
      options: [
        { key: 'never', title: 'Хэзээ ч үгүй', description: 'Би бүх цаг үед бүрэн хянаж чаддаг.' },
        { key: 'rarely', title: 'Ховор', description: 'Долоо хоногт нэгээс бага удаа.' },
        { key: 'sometimes', title: 'Заримдаа', description: 'Долоо хоногт хэд хэдэн удаа.' },
        { key: 'frequently', title: 'Ойрхон', description: 'Өдөр бүр эсвэл өдөрт хэд хэдэн удаа.' },
      ],
      sortOrder: 1,
    },
  ]);
  console.log('Seeded assessment questions');

  const demoOrder = await Order.create({
    orderNumber: 'VM-DEMO001',
    userId: demoAppUser.id,
    status: 'paid',
    totalMnt: 89000,
    customerName: 'Доктор Жеймс Стерлинг',
    customerPhone: '99112233',
    customerEmail: 'demo@tenkhee.mn',
    shippingAddress: 'Улаанбаатар, СБД',
    paymentMethod: 'qpay',
  });
  await OrderItem.create({
    orderId: demoOrder.id,
    productId: 'mag-glycinate',
    productName: 'Магнийн глицинат 400мг',
    quantity: 1,
    unitPriceMnt: 89000,
    lineTotalMnt: 89000,
  });
  console.log('Seeded demo order');

  await PaymentSettings.create({
    id: 'default',
    qpayEnabled: true,
    emailLoginEnabled: true,
    bankName: 'Хаан банк',
    bankAccountNumber: '5000123456',
    bankAccountName: 'Tenkhee LLC',
    transferNote:
      'Гүйлгээний утга дээр имэйл хаягаа бичнэ үү. Төлбөр баталгаажмагц таны эрх идэвхжинэ.',
  });
  console.log('Seeded payment settings');

  await HospitalCategory.bulkCreate(hospitalCategories);
  console.log(`Seeded ${hospitalCategories.length} hospital categories`);

  await Hospital.bulkCreate(hospitals);
  console.log(`Seeded ${hospitals.length} hospitals`);

  await CoachSetting.create(coachSetting);
  await CoachProgram.bulkCreate(coachPrograms);
  await PromoCode.bulkCreate(promoCodes);
  console.log(
    `Seeded coach settings, ${coachPrograms.length} coach programs, ${promoCodes.length} promo codes`
  );

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
