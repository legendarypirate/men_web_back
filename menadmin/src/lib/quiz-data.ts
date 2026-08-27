export type QuizOption = {
  id: string;
  label: string;
  emoji?: string;
};

export type QuizQuestionStep = {
  type: 'question';
  id: string;
  title: string;
  subtitle?: string;
  options: QuizOption[];
};

export type QuizInfoStep = {
  type: 'info';
  id: string;
  title: string;
  body: string;
  stat?: string;
};

export type QuizStep = QuizQuestionStep | QuizInfoStep;

export const QUIZ_STEPS: QuizStep[] = [
  {
    type: 'question',
    id: 'age',
    title: 'Та хэдэн настай вэ?',
    subtitle: 'Насны ангилалд үндэслэн дасгалын хэмжээг тохируулна.',
    options: [
      { id: '18-30', label: '18–30', emoji: '🙂' },
      { id: '31-40', label: '31–40', emoji: '🙂' },
      { id: '41-50', label: '41–50', emoji: '😐' },
      { id: '51+', label: '51+', emoji: '🧔' },
    ],
  },
  {
    type: 'question',
    id: 'kegel_experience',
    title: 'Та Кегелийн дасгал хийж байсан уу?',
    options: [
      { id: 'never', label: 'Хэзээ ч хийж байгаагүй', emoji: '❌' },
      { id: 'tried', label: 'Оролдсон, гэхдээ тогтмол биш', emoji: '🤔' },
      { id: 'sometimes', label: 'Заримдаа хийдэг', emoji: '👍' },
      { id: 'regular', label: 'Тогтмол хийдэг', emoji: '💪' },
    ],
  },
  {
    type: 'info',
    id: 'info_blood_flow',
    title: 'Энгийн дасгалаар илүү сайн цусны урсац',
    body: 'Кегелийн дасгал нь аарцгийн ёроолын булчинг бэхжүүлж, цусны урсацыг сайжруулдаг. Энэ нь илүү бат бөх эрекц, илүү сайн хяналт, илүү итгэлтүй бэлгийн амьдралд тусална.',
    stat: 'Mayo Clinic-ийн судалгаанд дурдсан',
  },
  {
    type: 'question',
    id: 'performance_satisfaction',
    title: 'Та бэлгийн гүйцэтгэлээсээ сэтгэл хангалуун байна уу?',
    options: [
      { id: 'very', label: 'Маш их', emoji: '😊' },
      { id: 'somewhat', label: 'Зарим талаар', emoji: '🙂' },
      { id: 'not_really', label: 'Тийм ч биш', emoji: '😐' },
      { id: 'not_at_all', label: 'Огт биш', emoji: '😔' },
    ],
  },
  {
    type: 'info',
    id: 'info_stamina',
    title: 'Оронд илүү удаан байх боломжтой',
    body: 'Аарцгийн ёроолын булчин нь эjacуляцийн хяналтад чухал үүрэгтэй. Тогтмол Кегел дасгал нь бэлгийн харилцаанд илүү удаан, илүү сайн хяналттай байхад тусалж болно.',
    stat: 'Эрүүл мэндийн мэргэжилтнүүд зөвлөж байна',
  },
  {
    type: 'question',
    id: 'finish_early',
    title: 'Хүссэнээсээ өмнө дуусах тохиолдол хэр олон удаа гардаг вэ?',
    options: [
      { id: 'never', label: 'Хэзээ ч үгүй', emoji: '✅' },
      { id: 'rarely', label: 'Ховор', emoji: '🙂' },
      { id: 'sometimes', label: 'Заримдаа', emoji: '😐' },
      { id: 'often', label: 'Байнга', emoji: '😟' },
    ],
  },
  {
    type: 'question',
    id: 'erection_quality',
    title: 'Бэлгийн харилцаанд бат бөх эрекцтэй байдаг уу?',
    options: [
      { id: 'always', label: 'Үргэлж', emoji: '💪' },
      { id: 'usually', label: 'Ихэнхдээ', emoji: '👍' },
      { id: 'sometimes', label: 'Заримдаа', emoji: '🤔' },
      { id: 'rarely', label: 'Ховор эсвэл үгүй', emoji: '😔' },
    ],
  },
  {
    type: 'info',
    id: 'info_social_proof',
    title: '10 эрэгтэйн 8 нь гүйцэтгэлээ сайжруулсан',
    body: 'Tenkhee Plus-ийн хувийн Кегел хөтөлбөр нь нас, зорилго, түвшинг тань харгалзан өдөр бүр 5–12 минутын дасгал санал болгодог.',
    stat: 'Хэрэглэгчдийн 87% 4 долоо хоногийн дотор ялгаа мэдэрсэн',
  },
  {
    type: 'question',
    id: 'sitting_hours',
    title: 'Өдөрт хэдэн цаг суудаг вэ?',
    subtitle: 'Удаан суух нь аарцгийн ёроолын булчин сулрахад нөлөөлдөг.',
    options: [
      { id: '0-2', label: '0–2 цаг', emoji: '🚶' },
      { id: '3-5', label: '3–5 цаг', emoji: '💺' },
      { id: '6-8', label: '6–8 цаг', emoji: '🖥️' },
      { id: '8+', label: '8+ цаг', emoji: '🪑' },
    ],
  },
  {
    type: 'question',
    id: 'relationship',
    title: 'Таны харилцааны байдал?',
    options: [
      { id: 'single', label: 'Ганц бие', emoji: '🙂' },
      { id: 'dating', label: 'Харилцаатай', emoji: '💑' },
      { id: 'married', label: 'Гэрлэлттэй', emoji: '💍' },
      { id: 'complicated', label: 'Нарийвчилж хэлэхгүй', emoji: '🤐' },
    ],
  },
  {
    type: 'question',
    id: 'activity_frequency',
    title: 'Сар бүр хэдэн удаа бэлгийн харилцаанд ордог вэ?',
    options: [
      { id: '0', label: '0 удаа', emoji: '➖' },
      { id: '1-4', label: '1–4 удаа', emoji: '1️⃣' },
      { id: '5-10', label: '5–10 удаа', emoji: '🔥' },
      { id: '10+', label: '10+ удаа', emoji: '💯' },
    ],
  },
  {
    type: 'question',
    id: 'pills',
    title: 'Бэлгийн амьдралаа сайжруулах эм хэрэглэж байсан уу?',
    options: [
      { id: 'never', label: 'Хэзээ ч үгүй', emoji: '✅' },
      { id: 'tried', label: 'Оролдсон', emoji: '💊' },
      { id: 'currently', label: 'Одоо хэрэглэж байна', emoji: '⚠️' },
      { id: 'prefer_not', label: 'Хэлэхгүй', emoji: '🤐' },
    ],
  },
  {
    type: 'info',
    id: 'info_program',
    title: 'Tenkhee Plus хөтөлбөр эмээс илүү',
    body: 'Эм нь түр зуурын шийдэл байж болох ч Кегел дасгал нь аарцгийн ёроолыг бэхжүүлж, урт хугацааны үр дүнг өгдөг. Таны хариултууд дээр үндэслэн бид хувийн төлөвлөгөө бэлтгэнэ.',
  },
  {
    type: 'question',
    id: 'stress',
    title: 'Стрессийн түвшинг хэрхэн үнэлэх вэ?',
    options: [
      { id: 'low', label: 'Бага', emoji: '😌' },
      { id: 'moderate', label: 'Дунд', emoji: '😐' },
      { id: 'high', label: 'Өндөр', emoji: '😰' },
      { id: 'very_high', label: 'Маш өндөр', emoji: '😫' },
    ],
  },
  {
    type: 'question',
    id: 'primary_goal',
    title: 'Таны гол зорилго юу вэ?',
    subtitle: 'Энэ асуултын дараа таны хувийн төлөвлөгөө бэлтгэгдэнэ.',
    options: [
      { id: 'control', label: 'Давсагны хяналт', emoji: '💧' },
      { id: 'performance', label: 'Бэлгийн гүйцэтгэл', emoji: '❤️' },
      { id: 'strength', label: 'Аарцгийн ёроол бэхжүүлэх', emoji: '🏋️' },
      { id: 'overall', label: 'Ерөнхий эрүүл мэнд', emoji: '⚡' },
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
