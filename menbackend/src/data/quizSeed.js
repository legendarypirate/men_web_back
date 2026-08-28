const QUIZ_STAGES = [
  { id: 1, label: 'Ерөнхий', sortOrder: 1 },
  { id: 2, label: 'Бэлгийн эрүүл мэнд', sortOrder: 2 },
  { id: 3, label: 'Амьдралын хэв маяг', sortOrder: 3 },
  { id: 4, label: 'Зорилго', sortOrder: 4 },
];

const QUIZ_QUESTIONS = [
  {
    id: 'age',
    stageId: 1,
    sortOrder: 1,
    title: 'Та хэдэн настай вэ?',
    options: [
      { id: '18-30', label: '18–30' },
      { id: '31-40', label: '31–40' },
      { id: '41-50', label: '41–50' },
      { id: '51+', label: '51+' },
    ],
  },
  {
    id: 'kegel_experience',
    stageId: 1,
    sortOrder: 2,
    title: 'Та Кегелийн дасгал хийж байсан уу?',
    options: [
      { id: 'never', label: 'Хэзээ ч хийж байгаагүй' },
      { id: 'tried', label: 'Оролдсон, гэхдээ тогтмол биш' },
      { id: 'sometimes', label: 'Заримдаа хийдэг' },
      { id: 'regular', label: 'Тогтмол хийдэг' },
    ],
  },
  {
    id: 'smoke',
    stageId: 1,
    sortOrder: 3,
    title: 'Та тамхи татдаг уу?',
    options: [
      { id: 'yes', label: 'Тийм, татдаг' },
      { id: 'no', label: 'Үгүй, татдаггүй' },
      { id: 'sometimes', label: 'Заримдаа' },
    ],
  },
  {
    id: 'relationship',
    stageId: 1,
    sortOrder: 4,
    title: 'Таны харилцааны байдал?',
    options: [
      { id: 'single', label: 'Ганц бие' },
      { id: 'dating', label: 'Харилцаатай' },
      { id: 'married', label: 'Гэрлэлттэй' },
      { id: 'other', label: 'Бусад' },
    ],
  },
  {
    id: 'performance_satisfaction',
    stageId: 2,
    sortOrder: 5,
    title: 'Та бэлгийн гүйцэтгэлээсээ сэтгэл хангалуун байна уу?',
    options: [
      { id: 'very', label: 'Маш их' },
      { id: 'somewhat', label: 'Зарим талаар' },
      { id: 'not_really', label: 'Тийм ч биш' },
      { id: 'not_at_all', label: 'Огт биш' },
    ],
  },
  {
    id: 'size_satisfaction',
    stageId: 2,
    sortOrder: 6,
    title: 'Та хэмжээгээсээ сэтгэл хангалуун байна уу?',
    options: [
      { id: 'very', label: 'Маш их' },
      { id: 'somewhat', label: 'Зарим талаар' },
      { id: 'not_really', label: 'Тийм ч биш' },
      { id: 'not_at_all', label: 'Огт биш' },
    ],
  },
  {
    id: 'finish_early',
    stageId: 2,
    sortOrder: 7,
    title: 'Хүссэнээсээ өмнө дуусах тохиолдол хэр олон удаа гардаг вэ?',
    options: [
      { id: 'never', label: 'Хэзээ ч үгүй' },
      { id: 'rarely', label: 'Ховор' },
      { id: 'sometimes', label: 'Заримдаа' },
      { id: 'often', label: 'Байнга' },
    ],
  },
  {
    id: 'erection_quality',
    stageId: 2,
    sortOrder: 8,
    title: 'Бэлгийн харилцаанд бат бөх эрекцтэй байдаг уу?',
    options: [
      { id: 'always', label: 'Үргэлж' },
      { id: 'usually', label: 'Ихэнхдээ' },
      { id: 'sometimes', label: 'Заримдаа' },
      { id: 'rarely', label: 'Ховор эсвэл үгүй' },
    ],
  },
  {
    id: 'activity_frequency',
    stageId: 2,
    sortOrder: 9,
    title: 'Сар бүр хэдэн удаа бэлгийн харилцаанд ордог вэ?',
    options: [
      { id: '0', label: '0 удаа' },
      { id: '1-4', label: '1–4 удаа' },
      { id: '5-10', label: '5–10 удаа' },
      { id: '10+', label: '10+ удаа' },
    ],
  },
  {
    id: 'sitting_hours',
    stageId: 3,
    sortOrder: 10,
    title: 'Өдөрт хэдэн цаг суудаг вэ?',
    options: [
      { id: '0-2', label: '0–2 цаг' },
      { id: '3-5', label: '3–5 цаг' },
      { id: '6-8', label: '6–8 цаг' },
      { id: '8+', label: '8+ цаг' },
    ],
  },
  {
    id: 'diet',
    stageId: 3,
    sortOrder: 11,
    title: 'Та хоолны дэглэм бариддаг уу?',
    options: [
      { id: 'yes', label: 'Тийм, баримталдаг' },
      { id: 'trying', label: 'Оролдож байгаа' },
      { id: 'no', label: 'Үгүй' },
    ],
  },
  {
    id: 'alcohol',
    stageId: 3,
    sortOrder: 12,
    title: 'Та архi их уудаг уу?',
    options: [
      { id: 'never', label: 'Хэзээ ч үгүй' },
      { id: 'sometimes', label: 'Заримдаа' },
      { id: 'often', label: 'Байнга' },
    ],
  },
  {
    id: 'stress',
    stageId: 3,
    sortOrder: 13,
    title: 'Стрессийн түвшинг хэрхэн үнэлэх вэ?',
    options: [
      { id: 'low', label: 'Бага' },
      { id: 'moderate', label: 'Дунд' },
      { id: 'high', label: 'Өндөр' },
      { id: 'very_high', label: 'Маш өндөр' },
    ],
  },
  {
    id: 'pills',
    stageId: 3,
    sortOrder: 14,
    title: 'Бэлгийн амьдралаа сайжруулах эм хэрэглэж байсан уу?',
    options: [
      { id: 'never', label: 'Хэзээ ч үгүй' },
      { id: 'tried', label: 'Оролдсон' },
      { id: 'currently', label: 'Одоо хэрэглэж байна' },
    ],
  },
  {
    id: 'bladder_control',
    stageId: 4,
    sortOrder: 15,
    title: 'Танд шээс яаралтай хүрэх тохиолдол хэр их гардаг вэ?',
    options: [
      { id: 'never', label: 'Хэзээ ч үгүй' },
      { id: 'rarely', label: 'Ховор' },
      { id: 'sometimes', label: 'Заримдаа' },
      { id: 'often', label: 'Байнга' },
    ],
  },
  {
    id: 'primary_goal',
    stageId: 4,
    sortOrder: 16,
    title: 'Таны гол зорилго юу вэ?',
    options: [
      { id: 'control', label: 'Давсагны хяналт' },
      { id: 'performance', label: 'Бэлгийн гүйцэтгэл' },
      { id: 'strength', label: 'Аарцгийн ёроол бэхжүүлэх' },
      { id: 'overall', label: 'Ерөнхий эрүүл мэнд' },
    ],
  },
];

const QUIZ_CONFIG = {
  id: 'default',
  processingTitle: 'Таны төлөвлөгөө бэлтгэгдэж байна',
  processingMessages: [
    'Хариултуудыг шинжилж байна...',
    'Аарцгийн ёроолын түвшинг тооцож байна...',
    'Дасгалын хэмжээг тохируулж байна...',
    'Хувийн Кегel төлөвлөгөө бэлтгэж байна...',
  ],
  active: true,
};

module.exports = { QUIZ_STAGES, QUIZ_QUESTIONS, QUIZ_CONFIG };
