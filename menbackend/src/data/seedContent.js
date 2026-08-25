const hospitals = [
  {
    id: 'tenkhee-urology',
    name: 'Tenkhee Аарцгийн эмнэлэг',
    address: 'СБД, 1-р хороо, Чингисийн өргөн чөлөө 15',
    phone: '7700-1234',
    imageUrl:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=240&h=240',
    openHours: 'Даваа–Баасан 09:00–18:00',
    description:
      'Эрчим хүчний эмгэг, аарцгийн ёроол, урологийн асуудалд мэргэшсэн эмнэлэг.',
    tags: ['Андрологи', 'Kegel', 'БЗДХ', 'Урологи'],
    categoryIds: ['urology', 'andrology', 'kegel', 'std'],
    doctors: [
      {
        id: 'd1',
        name: 'Д.Бат-Эрдэнэ',
        specialty: 'Urologi эмч',
        experienceYears: 12,
        bio: 'Эрчим хүчний эмгэг, аарцгийн ёроолын эмчилгээнд мэргэшсэн.',
      },
      {
        id: 'd2',
        name: 'Г.Отгонбаяр',
        specialty: 'Andrologi эмч',
        experienceYears: 8,
        bio: 'Эрүүл мэндийн үнэлгээ, гормонын зөвлөгөө.',
      },
    ],
    services: [
      {
        id: 's1',
        name: 'Анхны зөвлөгөө',
        priceMnt: 45000,
        category: 'Зөвлөгөө',
        doctorId: 'd1',
        description: '30 минутын эмчийн үзлэг',
      },
      {
        id: 's2',
        name: 'Аарцгийн ёроолын үнэлгээ',
        priceMnt: 85000,
        category: 'Үнэлгээ',
        doctorId: 'd1',
      },
      {
        id: 's3',
        name: 'Ultrasound шинжилгээ',
        priceMnt: 65000,
        category: 'Шинжилгээ',
        doctorId: 'd1',
      },
      {
        id: 's4',
        name: 'Гормонын шинжилгээний багц',
        priceMnt: 120000,
        category: 'Шинжилгээ',
        doctorId: 'd2',
      },
      {
        id: 's5',
        name: 'Давтан зөвлөгөө',
        priceMnt: 35000,
        category: 'Зөвлөгөө',
        doctorId: 'd2',
      },
    ],
    sortOrder: 0,
    active: true,
  },
  {
    id: 'men-health-ub',
    name: 'Эрүүл эрх UB Эмнэлэг',
    address: 'ХУД, 3-р хороо, Sambuu square ойролцоо',
    phone: '7711-5678',
    imageUrl:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=240&h=240',
    openHours: 'Даваа–Ням 10:00–20:00',
    description:
      'Эрэгтэйчүүдийн эрүүл мэнд, бэлгийн эрүүл мэнд, сэтгэл зүйн дэмжлэг.',
    tags: ['БЗДХ', 'Сэтгэл засал', 'Ерөнхий үзлэг'],
    categoryIds: ['std', 'psychology', 'general'],
    doctors: [
      {
        id: 'd3',
        name: 'Ц.Мөнхбат',
        specialty: 'Эрүүл мэндийн эмч',
        experienceYears: 15,
      },
      {
        id: 'd4',
        name: 'Б.Сарангэрэл',
        specialty: 'Сэтгэл зүйч',
        experienceYears: 6,
      },
    ],
    services: [
      { id: 's6', name: 'Ерөнхий үзлэг', priceMnt: 40000, category: 'Үзлэг', doctorId: 'd3' },
      {
        id: 's7',
        name: 'Бэлгийн эрүүл мэндийн зөвлөгөө',
        priceMnt: 55000,
        category: 'Зөвлөгөө',
        doctorId: 'd3',
      },
      {
        id: 's8',
        name: 'STD шинжилгээний багц',
        priceMnt: 95000,
        category: 'Шинжилгээ',
        doctorId: 'd3',
      },
      {
        id: 's9',
        name: 'Сэтгэл зүйн зөвлөгөө (50 мин)',
        priceMnt: 60000,
        category: 'Зөвлөгөө',
        doctorId: 'd4',
      },
    ],
    sortOrder: 1,
    active: true,
  },
  {
    id: 'national-mens-center',
    name: 'Үндэсний Эрүүл эрх төв',
    address: 'БЗД, 26-р хороо, Peace avenue 88',
    phone: '7600-9012',
    imageUrl:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=240&h=240',
    openHours: 'Даваа–Баасан 08:00–17:00',
    description:
      'Төрийн албан ёсны эрүүл эрхийн үзлэг, мэдрэмж, Kegel сургалт.',
    tags: ['Kegel', 'Урологи'],
    categoryIds: ['kegel', 'urology'],
    doctors: [
      {
        id: 'd5',
        name: 'Н.Энхтуяа',
        specialty: 'Физик эмчилгээний эмч',
        experienceYears: 10,
      },
    ],
    services: [
      {
        id: 's10',
        name: 'Аарцгийн ёроолын Kegel сургалт (1 цаг)',
        priceMnt: 30000,
        category: 'Сургалт',
        doctorId: 'd5',
      },
      {
        id: 's11',
        name: 'Biofeedback эмчилгээ',
        priceMnt: 75000,
        category: 'Эмчилгээ',
        doctorId: 'd5',
      },
      {
        id: 's12',
        name: 'Давсагны хяналтын зөвлөгөө',
        priceMnt: 35000,
        category: 'Зөвлөгөө',
        doctorId: 'd5',
      },
    ],
    sortOrder: 2,
    active: true,
  },
  {
    id: 'premium-mens-clinic',
    name: "Premium Men's Clinic",
    address: 'СХД, 11-р хороо, 3-р микрорайон',
    phone: '7777-3344',
    imageUrl:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=240&h=240',
    openHours: 'Даваа–Бямба 09:00–19:00',
    description:
      'Дээд зэрэглэлийн эрүүл эрхийн үйлчилгээ, хурдан шинжилгээ, VIP зөвлөгөө.',
    tags: ['Урологи', 'VIP'],
    categoryIds: ['urology', 'andrology'],
    doctors: [
      {
        id: 'd6',
        name: 'Т.Амар',
        specialty: 'Urologi, хирург',
        experienceYears: 18,
      },
      {
        id: 'd7',
        name: 'Л.Болормаа',
        specialty: 'Лаборатори эмч',
        experienceYears: 9,
      },
    ],
    services: [
      {
        id: 's13',
        name: 'VIP эмчийн үзлэг',
        priceMnt: 150000,
        category: 'VIP',
        doctorId: 'd6',
        description: '60 минут, хувийн өрөө',
      },
      {
        id: 's14',
        name: 'Хурдан PSA шинжилгээ',
        priceMnt: 48000,
        category: 'Шинжилгээ',
        doctorId: 'd7',
      },
      {
        id: 's15',
        name: 'Urologi хирургийн зөвлөгөө',
        priceMnt: 90000,
        category: 'Зөвлөгөө',
        doctorId: 'd6',
      },
      {
        id: 's16',
        name: 'Бүрэн эрүүл мэндийн багц',
        priceMnt: 280000,
        category: 'Багц',
        doctorId: 'd6',
        description: 'Үзлэг + шинжилгээ + зөвлөгөө',
      },
    ],
    sortOrder: 3,
    active: true,
  },
];

const coachSetting = {
  id: 'default',
  screenTitle: 'Explore',
  bannerTitle: 'Private Coaching Is Now Available',
  bannerSubtitle: 'Expert 1:1 support is now available inside Tenkhee.',
  coachName: 'Dr. Sarah Chen',
  coachRole: 'Sexual Health Coach',
  coachImageUrl:
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
  learnMoreLabel: 'Learn More',
  active: true,
};

const promoCodes = [
  {
    code: 'WELCOME20',
    label: 'Premium — 20% off',
    discountPercent: 20,
    planIds: [],
    maxUses: 500,
    usedCount: 0,
    active: true,
  },
  {
    code: 'YEARLY30',
    label: 'Yearly plan — 30% off',
    discountPercent: 30,
    planIds: ['yearly'],
    maxUses: 200,
    usedCount: 0,
    active: true,
  },
  {
    code: 'MONTHLY15',
    label: 'Monthly plan — 15% off',
    discountPercent: 15,
    planIds: ['monthly'],
    maxUses: 150,
    usedCount: 0,
    active: true,
  },
];

const coachPrograms = [
  {
    id: 'coach_main_last_longer',
    title: 'Last Longer',
    category: 'SEXUAL HEALTH',
    description:
      'Trains your brain to control it and last as long as you want without pills.',
    duration: '6 weeks',
    exerciseCount: 9,
    imageUrl:
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop',
    section: 'main',
    sortOrder: 0,
    active: true,
  },
  {
    id: 'coach_rec_overall_health',
    title: 'Overall Health',
    category: 'WELL-BEING',
    description: 'Build daily habits for energy, sleep, and confidence.',
    duration: '2 weeks',
    exerciseCount: 5,
    imageUrl:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=800&fit=crop',
    section: 'recommended',
    sortOrder: 0,
    active: true,
  },
  {
    id: 'coach_rec_stress_relief',
    title: 'Stress Relief',
    category: 'MENTAL HEALTH',
    description: 'Reduce anxiety and improve focus with guided routines.',
    duration: '3 weeks',
    exerciseCount: 7,
    imageUrl:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=800&fit=crop',
    section: 'recommended',
    sortOrder: 1,
    active: true,
  },
  {
    id: 'coach_rec_core_strength',
    title: 'Core Strength',
    category: 'FITNESS',
    description: 'Strengthen pelvic floor and core for better control.',
    duration: '4 weeks',
    exerciseCount: 8,
    imageUrl:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=800&fit=crop',
    section: 'recommended',
    sortOrder: 2,
    active: true,
  },
  {
    id: 'coach_course_mindful_intimacy',
    title: 'Mindful Intimacy',
    category: 'RELATIONSHIPS',
    description: 'Communication skills for deeper connection.',
    duration: '1 week',
    exerciseCount: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=800&fit=crop',
    section: 'courses',
    sortOrder: 0,
    active: true,
  },
  {
    id: 'coach_course_sleep_reset',
    title: 'Sleep Reset',
    category: 'WELL-BEING',
    description: 'Restore energy with science-backed sleep routines.',
    duration: '2 weeks',
    exerciseCount: 6,
    imageUrl:
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&h=800&fit=crop',
    section: 'courses',
    sortOrder: 1,
    active: true,
  },
  {
    id: 'coach_course_nutrition',
    title: 'Nutrition Basics',
    category: 'HEALTH',
    description: 'Simple nutrition for vitality and performance.',
    duration: '2 weeks',
    exerciseCount: 5,
    imageUrl:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=800&fit=crop',
    section: 'courses',
    sortOrder: 2,
    active: true,
  },
];

const kegelDetailSections = [
  {
    title: 'Formula 01',
    description:
      'Аарцгийн ёроолын булчинг бэхжүүлж, тэсвэрлэх чадварыг нэмэгдүүлэх био-feedback горим.',
    dosage:
      'Өдөрт 10–15 минут, 7 хоногийн турш өглөө эсвэл орой. Эхлэгчид 5 минутаас эхэлж постепенно нэмнэ.',
    ingredients:
      'Медицин зэрэглэлийн silicone, Bluetooth 5.0 модуль, био-feedback мэдрэгч, USB-C цэнэглэгч.',
    sortOrder: 0,
  },
  {
    title: 'Formula 02',
    description:
      'Илүү хүчтэй агшилтын горим — булчингийн хяналт, тогтвортой байдал, хүчийг нэгтгэн сайжруулна.',
    dosage:
      'Долоо хоногт 4–5 удаа, 12–15 минут. Амрах өдөр бүртгэж, хэт их ачааллаас зайлсхий.',
    ingredients:
      'Давхар мэдрэгчтэй корпус, апп дээрх персоналчилсан дасгалын төлөвлөгөө, статистик хяналт.',
    sortOrder: 1,
  },
  {
    title: 'Formula 03',
    description:
      'Сэргээлтийн зөөлөн горим — амарч, тайвшруулах дасгал, урт хугацааны хэв маягийг дэмжинэ.',
    dosage: 'Оройн цагт 8–10 минут, нойрны өмнө. Долоо хоногт 3–4 удаа.',
    ingredients:
      'Зөөлөн давтамжийн програм, амьсгалын дасгалын заавар, апп-ийн сэргээлтийн таймер.',
    sortOrder: 2,
  },
];

const articles = [
  {
    category: 'Шилдэг сонголтууд',
    title: 'Илүү сайн унтах 13 зөвлөгөө',
    excerpt: 'Гүн, сэргэг унтах энгийн дадал.',
    body:
      'Тогтмол цаг. Өдөр бүр ижил цагт унтаж, сэрэх дадал барь.\n' +
      'Давхарга. Өрөөгөө харанхуй, чимээгүй, сэрүүн байлга.\n' +
      'Дэлгэц. Унтахаас 1 цагийн өмнө утас, TV-ээс зайлсхий.\n' +
      'Кофe. Үдээс хойш кофe, улаан цай уухгүй бай.\n' +
      'Дасгал. Өдөрт 20–30 мин алхах нь гүн унтахад тусална.',
    readMinutes: 6,
    featured: true,
    isNew: false,
    sortOrder: 0,
    published: true,
    imageUrl:
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=560&h=720',
  },
  {
    category: 'Шилдэг сонголтууд',
    title: 'Хэмжээ үнэхээр чухал уу?',
    excerpt: 'Өөртөө итгэлтэй байдал болон сэтгэл ханамжийн талаар шинжлэх ухаан юу хэлдэг вэ.',
    body:
      'Өөртөө итгэх. Сэтгэл ханамж хэмжээнээс илүү сэтгэл зүйтэй холбоотой.\n' +
      'Харилцаа. Нээлттэй ярилцах нь физик хэмжээнээс чухал.\n' +
      'Стресс. Стресс бэлгийн хүчийг илүү их нөлөөлдөг.',
    readMinutes: 5,
    featured: true,
    sortOrder: 1,
    published: true,
    imageUrl:
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=560&h=720',
  },
  {
    category: 'Бэлгийн эрүүл мэнд',
    title: 'Либидогоо буулгах зүйлс',
    excerpt: 'Хүсэл хоромлон бууруулдаг өдөр тутмын дадал.',
    body:
      'Стресс. Урт хугацааны стресс либидог буулгадаг.\n' +
      'Нойр. Дутуу нойр бэлгийн хүчийг буулгана.\n' +
      'Алcohol. Илүү их архи хэрэглэлт либидог буулгана.',
    readMinutes: 7,
    sortOrder: 2,
    published: true,
    imageUrl:
      'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=560&h=720',
  },
  {
    category: 'Сэргээлт',
    title: 'Урт наслалтад зориулсан гүн сэргээлтийн шинжлэх ухаан',
    excerpt: 'Гүн сэргээлт болон урт наслалтын холбоо.',
    author: 'Доктор Жулиен Торн',
    readMinutes: 8,
    tag: 'ГҮЙЦЭТГЭЛИЙН АХИСАН ТҮВШИН',
    featured: true,
    isNew: true,
    sortOrder: 3,
    published: true,
    imageUrl:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=560&h=720',
    storySlides: [
      {
        isCover: true,
        imageUrl:
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&h=1400',
        accentLine: 'УРТ',
        line2: 'НАСЛАЛТАД ЗОРИУЛСАН',
        line3: 'ГҮН СЭРГЭЭЛТИЙН ШИНЖЛЭХ УХААН',
      },
      {
        isCover: false,
        imageUrl:
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&h=1400',
        accentLine: '1',
        line2: 'Гүн нойр',
        body: 'Гүн сэргээлт болон урт наслалтын холбоог ойлгоорой.',
      },
      {
        isCover: false,
        imageUrl:
          'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&h=1400',
        accentLine: '2',
        line2: 'HRV хяналт',
        body: 'Зүрхний цохилтын хэлбэлзэл (HRV) сэргээлтийн чанарыг хэмжих гол үзүүлэлт.',
      },
    ],
  },
  {
    category: 'Хоол тэжээл',
    title: 'Төвлөрлийг хадгалах өглөөний цайны хамгийн тохиромжтой макро шим тэжээл',
    excerpt:
      'Өглөөний уураг, өөх тосны тодорхой харьцаа нь инсулиныг хэрхэн тогтворжуулж, танин мэдэхүйг сайжруулдгийг мэдэж аваарай.',
    readMinutes: 5,
    tag: 'Хоол тэжээл',
    sortOrder: 4,
    published: true,
    imageUrl:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=560&h=720',
  },
  {
    category: 'Шинжлэх ухаан',
    title: 'VO2 Max-ийг эрүүл мэндийн үзүүлэлт болгон ойлгох нь',
    excerpt:
      'Шинэ судалгаагаар таны зүрх судасны үйл ажиллагаа нь хамгийн чухал үзүүлэлт болохыг харуулж байна.',
    readMinutes: 12,
    tag: 'Шинжлэх ухаан',
    sortOrder: 5,
    published: true,
    imageUrl:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=560&h=720',
  },
];

const homeProTips = [
  {
    text: 'Төлөвлөгөөний талаар асуулт байвал "FAQ"-ийг уншина уу.',
    actionLabel: 'FAQ',
    sortOrder: 0,
    active: true,
  },
  {
    text: 'Өдөр бүр ижил цагт дасгал хийвэл илүү хурдан үр дүн гарна.',
    sortOrder: 1,
    active: true,
  },
  {
    text: 'Дасгалын дараа 2-3 минут гүн амьсгал авч булчингaа тайвшруул.',
    sortOrder: 2,
    active: true,
  },
  {
    text: 'Дасгалын явцад гүн, тогтвортой амьсгал хадгалах чухал.',
    sortOrder: 3,
    active: true,
  },
  {
    text: 'Мэдлэг хэсэгт шинэ нийтлэлүүдийг тогтмол шалгаарай.',
    actionLabel: 'Мэдлэг',
    sortOrder: 4,
    active: true,
  },
];

const hospitalCategories = [
  {
    id: 'urology',
    title: 'Урологи',
    description: 'Бөөр, давсаг, шээсний зам, түрүү булчирхай',
    icon: 'water_drop_outlined',
    sortOrder: 0,
    active: true,
  },
  {
    id: 'andrology',
    title: 'Андрологи',
    description: 'Эрекц, хурдан гадагшлалт, үргүйдэл, тестостерон',
    icon: 'male_outlined',
    sortOrder: 1,
    active: true,
  },
  {
    id: 'std',
    title: 'БЗДХ шинжилгээ',
    description: 'Заг хүйтэн, тэмбүү зэрэг халдварын оношилгоо',
    icon: 'verified_user_outlined',
    sortOrder: 2,
    active: true,
  },
  {
    id: 'psychology',
    title: 'Сэтгэл засал',
    description: 'Бэлгийн сулралын сэтгэл зүйн зөвлөгөө',
    icon: 'chat_bubble_outline_rounded',
    sortOrder: 3,
    active: true,
  },
  {
    id: 'kegel',
    title: 'Kegel / Аарцагны булчин',
    description: 'Аарцагны ёроолын сургалт, biofeedback эмчилгээ',
    icon: 'adjust_outlined',
    sortOrder: 4,
    active: true,
  },
  {
    id: 'general',
    title: 'Ерөнхий үзлэг',
    description: 'Ерөнхий эрүүл мэндийн үзлэг, зөвлөгөө',
    icon: 'medical_services_outlined',
    sortOrder: 5,
    active: true,
  },
];

module.exports = {
  hospitals,
  hospitalCategories,
  coachSetting,
  coachPrograms,
  kegelDetailSections,
  promoCodes,
  articles,
  homeProTips,
};
