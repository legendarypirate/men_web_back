const hospitals = [
  {
    id: 'vitalmen-urology',
    name: 'VitalMen Аарцгийн эмнэлэг',
    address: 'СБД, 1-р хороо, Чингисийн өргөн чөлөө 15',
    phone: '7700-1234',
    imageUrl:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=240&h=240',
    openHours: 'Даваа–Баасан 09:00–18:00',
    description:
      'Эрчим хүчний эмгэг, аарцгийн ёроол, урологийн асуудалд мэргэшсэн эмнэлэг.',
    tags: ['Уrologi', 'Kegel', 'Зөвлөгөө'],
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
    tags: ['Бэлгийн эрүүл мэнд', 'Зөвлөгөө'],
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
    tags: ['Төрийн', 'Kegel', 'Реабилитаци'],
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
    tags: ['VIP', 'Хурдан шинжилгээ'],
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
  bannerSubtitle: 'Expert 1:1 support is now available inside VitalMen.',
  coachName: 'Dr. Sarah Chen',
  coachRole: 'Sexual Health Coach',
  coachImageUrl:
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
  learnMoreLabel: 'Learn More',
  active: true,
};

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

module.exports = {
  hospitals,
  coachSetting,
  coachPrograms,
  kegelDetailSections,
};
