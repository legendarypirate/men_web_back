export type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  stage: number;
  title: string;
  options: QuizOption[];
};

export const QUIZ_STAGES = [
  { id: 1, label: 'Ерөнхий' },
  { id: 2, label: 'Бэлгийн эрүүл мэнд' },
  { id: 3, label: 'Амьдралын хэв маяг' },
  { id: 4, label: 'Зорилго' },
] as const;

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Stage 1
  {
    id: 'age',
    stage: 1,
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
    stage: 1,
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
    stage: 1,
    title: 'Та тамхи татдаг уу?',
    options: [
      { id: 'yes', label: 'Тийм, татдаг' },
      { id: 'no', label: 'Үгүй, татдаггүй' },
      { id: 'sometimes', label: 'Заримдаа' },
    ],
  },
  {
    id: 'relationship',
    stage: 1,
    title: 'Таны харилцааны байдал?',
    options: [
      { id: 'single', label: 'Ганц бие' },
      { id: 'dating', label: 'Харилцаатай' },
      { id: 'married', label: 'Гэрлэлттэй' },
      { id: 'other', label: 'Бусад' },
    ],
  },
  // Stage 2
  {
    id: 'performance_satisfaction',
    stage: 2,
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
    stage: 2,
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
    stage: 2,
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
    stage: 2,
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
    stage: 2,
    title: 'Сар бүр хэдэн удаа бэлгийн харилцаанд ордог вэ?',
    options: [
      { id: '0', label: '0 удаа' },
      { id: '1-4', label: '1–4 удаа' },
      { id: '5-10', label: '5–10 удаа' },
      { id: '10+', label: '10+ удаа' },
    ],
  },
  // Stage 3
  {
    id: 'sitting_hours',
    stage: 3,
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
    stage: 3,
    title: 'Та хоолны дэглэм бариддаг уу?',
    options: [
      { id: 'yes', label: 'Тийм, баримталдаг' },
      { id: 'trying', label: 'Оролдож байгаа' },
      { id: 'no', label: 'Үгүй' },
    ],
  },
  {
    id: 'alcohol',
    stage: 3,
    title: 'Та архи их уудаг уу?',
    options: [
      { id: 'never', label: 'Хэзээ ч үгүй' },
      { id: 'sometimes', label: 'Заримдаа' },
      { id: 'often', label: 'Байнга' },
    ],
  },
  {
    id: 'stress',
    stage: 3,
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
    stage: 3,
    title: 'Бэлгийн амьдралаа сайжруулах эм хэрэглэж байсан уу?',
    options: [
      { id: 'never', label: 'Хэзээ ч үгүй' },
      { id: 'tried', label: 'Оролдсон' },
      { id: 'currently', label: 'Одоо хэрэглэж байна' },
    ],
  },
  // Stage 4
  {
    id: 'bladder_control',
    stage: 4,
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
    stage: 4,
    title: 'Таны гол зорилго юу вэ?',
    options: [
      { id: 'control', label: 'Давсагны хяналт' },
      { id: 'performance', label: 'Бэлгийн гүйцэтгэл' },
      { id: 'strength', label: 'Аарцгийн ёроол бэхжүүлэх' },
      { id: 'overall', label: 'Ерөнхий эрүүл мэнд' },
    ],
  },
];

export const PROCESSING_MESSAGES = [
  'Хариултуудыг шинжилж байна...',
  'Аарцгийн ёроолын түвшинг тооцож байна...',
  'Дасгалын хэмжээг тохируулж байна...',
  'Хувийн Кегel төлөвлөгөө бэлтгэж байна...',
];

export function buildQuizResult(answers: Record<string, string>) {
  const goal = answers.primary_goal ?? 'overall';
  const experience = answers.kegel_experience ?? 'never';
  const stress = answers.stress ?? 'moderate';

  const goalLabels: Record<string, string> = {
    control: 'Давсагны хяналт сайжруулах',
    performance: 'Бэлгийн гүйцэтгэл сайжруулах',
    strength: 'Аарцгийн ёроол бэхжүүлэх',
    overall: 'Ерөнхий эрүүл мэндийг сайжруулах',
  };

  const level =
    experience === 'regular' ? 'Дунд' : experience === 'sometimes' ? 'Эхлэгч+' : 'Эхлэгч';

  const minutes = stress === 'high' || stress === 'very_high' ? 8 : 12;

  return {
    goalLabel: goalLabels[goal] ?? goalLabels.overall,
    level,
    minutes,
    sessionsPerWeek: 5,
  };
}
