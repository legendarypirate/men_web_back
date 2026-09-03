const { DEFAULT_PROGRAM_INTRO_SLIDES } = require('./stretchIntroSlides');

const EXERCISES = {
  warriorII: {
    name: 'Warrior II',
    category: 'ХОНГО БА ААРЦАГ',
    instruction:
      'Хөлөө мөрнөөс өргөн тавьж, урд өвдгөө 90 градус нугална. Гараа мөрний түвшинд сунгаж, аарцаг болон гуяны дотор булчинг сунгана.',
    durationSeconds: 80,
    sets: 1,
    motion: 'coreBrace',
    motionHint: 'Урагш чиглэн тогтвортой байрлал хадгал',
    targetMuscles: 'Аарцгийн ёроол, Гуяны дотор тал, Хонго',
  },
  legsOnTheWall: {
    name: 'Legs on the wall',
    category: 'ЦУСНЫ ЭРГЭЛТ БА ТАЙВШРАЛ',
    instruction:
      'Нуруугаараа хэвтэж хөлөө хана дагуулан дээш өргөнө. Аарцагт цусан хангамж сайжирч, мэдрэлийн систем тайвширна.',
    durationSeconds: 123,
    sets: 1,
    motion: 'breath',
    motionHint: 'Гүн амьсгалж хэвлийн хэсгийг бүрэн сулла',
    targetMuscles: 'Аарцаг, Шөрмөс, Нурууны доод хэсэг',
  },
  butterflyStretch: {
    name: 'Butterfly Stretch',
    category: 'ААРЦГИЙН УЯН ХАТАН БАЙДАЛ',
    instruction:
      'Суугаад хөлийн улуудыг нийлүүлж, өвдгөө хажуу тийш зөөлөн буулгана. Нуруугаа тэгш байлгаж аарцагны булчингуудыг нээнэ.',
    durationSeconds: 90,
    sets: 1,
    motion: 'breath',
    motionHint: 'Амьсгаа гаргах бүрт өвдгөө доошлуул',
    targetMuscles: 'Аарцгийн ёроол, Цавины булчин',
  },
  deepSquatHold: {
    name: 'Deep Squat Hold',
    category: 'ААРЦГИЙН ТАЙВШРУУЛАЛТ',
    instruction:
      'Хөлөө мөрнөөс өргөн тавьж гүн сууж Malasana байрлал авна. Тохойгоороо өвдгөө гадагш түлхэн аарцгийн ёроолыг бүрэн суллана.',
    durationSeconds: 60,
    sets: 1,
    motion: 'kegelHold',
    motionHint: 'Аарцгийн ёроолын булчинг бүрэн суллаж сунга',
    targetMuscles: 'Аарцгийн ёроолын булчин, Хонго',
  },
};

const PELVIC_STRETCHING_PROGRAMS = [
  {
    id: 'pelvic_stretching',
    title: 'Pelvic Stretching',
    description:
      'Foundational pelvic mobility routine to improve flexibility and blood flow',
    level: 'Beginner',
    durationMinutes: 19,
    equipment: 'None',
    tag: 'PELVIC STRETCHING',
    kind: 'pelvic_stretching',
    isToday: false,
    sortOrder: 1,
    exercises: [
      EXERCISES.butterflyStretch,
      EXERCISES.legsOnTheWall,
      EXERCISES.deepSquatHold,
    ],
  },
  {
    id: 'pelvic_stretching_plus',
    title: 'Pelvic Stretching +',
    description:
      'Intermediate stretches for hip mobility and pelvic floor relaxation',
    level: 'Intermediate',
    durationMinutes: 17,
    equipment: 'Mat/Towel',
    tag: 'PELVIC STRETCHING',
    kind: 'pelvic_stretching',
    isToday: false,
    sortOrder: 2,
    exercises: [
      EXERCISES.warriorII,
      EXERCISES.butterflyStretch,
      EXERCISES.legsOnTheWall,
    ],
  },
  {
    id: 'pelvic_stretching_pro',
    title: 'Pelvic Stretching Pro',
    description:
      'Promotes flexibility and relaxation in the pelvic area, reducing muscle fatigue and overactivity',
    level: 'Advanced',
    durationMinutes: 17,
    equipment: 'Belt/Towel',
    tag: 'PELVIC STRETCHING',
    kind: 'pelvic_stretching',
    isToday: false,
    sortOrder: 3,
    exercises: [
      EXERCISES.warriorII,
      EXERCISES.legsOnTheWall,
      EXERCISES.butterflyStretch,
      EXERCISES.deepSquatHold,
    ],
  },
  {
    id: 'pelvic_relax_release',
    title: 'Pelvic Relax & Release',
    description:
      'Gentle tension-release program to calm hypertonic pelvic floor and improve blood circulation',
    level: 'Beginner',
    durationMinutes: 12,
    equipment: 'None',
    tag: 'PELVIC STRETCHING',
    kind: 'pelvic_stretching',
    isToday: false,
    sortOrder: 4,
    exercises: [
      EXERCISES.legsOnTheWall,
      EXERCISES.butterflyStretch,
      EXERCISES.deepSquatHold,
    ],
  },
  {
    id: 'deep_hip_pelvis',
    title: 'Deep Hip & Pelvis',
    description:
      'Comprehensive stretches for hip mobility, lower back decompression, and pelvic diaphragm flexibility',
    level: 'Intermediate',
    durationMinutes: 15,
    equipment: 'Mat/Towel',
    tag: 'PELVIC STRETCHING',
    kind: 'pelvic_stretching',
    isToday: false,
    sortOrder: 5,
    exercises: [
      EXERCISES.warriorII,
      EXERCISES.butterflyStretch,
      EXERCISES.legsOnTheWall,
      EXERCISES.deepSquatHold,
    ],
  },
  {
    id: 'morning_pelvic_awaken',
    title: 'Morning Pelvic Awaken',
    description:
      'Quick morning mobility routine to energize pelvic blood flow and loosen tight groin muscles',
    level: 'All Levels',
    durationMinutes: 10,
    equipment: 'None',
    tag: 'PELVIC STRETCHING',
    kind: 'pelvic_stretching',
    isToday: false,
    sortOrder: 6,
    exercises: [
      EXERCISES.warriorII,
      EXERCISES.butterflyStretch,
      EXERCISES.legsOnTheWall,
    ],
  },
].map((program) => ({
  ...program,
  videoUrl: null,
  thumbnailUrl: null,
  introSlides: DEFAULT_PROGRAM_INTRO_SLIDES,
}));

module.exports = { PELVIC_STRETCHING_PROGRAMS, EXERCISES };
