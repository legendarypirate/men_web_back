const { kegelHoldSequence } = require('./exercisePhases');

function challengeProgram({ id, title, level, days, sortOrder }) {
  return {
    id,
    title,
    description: `${days} хоногийн сорилт`,
    level: String(level),
    durationMinutes: 10,
    equipment: 'None',
    tag: 'KEGEL CHALLENGE',
    kind: 'kegel_challenge',
    isToday: false,
    isLocked: false,
    challengeLevel: level,
    challengeDays: days,
    sortOrder,
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
        phases: kegelHoldSequence('Кегелийн барих', {
          holdBlockSec: 25,
          relaxTabSec: 15,
          innerHoldSec: 5,
          innerRelaxSec: 5,
        }),
      },
    ],
  };
}

const KEGEL_LEVEL1_CHALLENGE = {
  ...challengeProgram({
    id: 'kegel_challenge_l1',
    title: 'Анхан шатны кегел дасгал',
    level: 1,
    days: 7,
    sortOrder: 0,
  }),
  description:
    'Гормоны хариу урвалыг дээд зэргээр нэмэгдүүлэхийн тулд огцом хөдөлгөөн болон хяналттай сунгалтын дасгалуудад анхаарлаа хандуулаарай.',
  isLocked: false,
  isToday: true,
};

const KEGEL_CHALLENGE_PROGRAMS = [
  KEGEL_LEVEL1_CHALLENGE,
  challengeProgram({
    id: 'kegel_challenge_l2',
    title: 'Mastering the Essentials',
    level: 2,
    days: 14,
    sortOrder: 20,
  }),
  challengeProgram({
    id: 'kegel_challenge_l3',
    title: 'Reverse, Relax & Control',
    level: 3,
    days: 21,
    sortOrder: 21,
  }),
  challengeProgram({
    id: 'kegel_challenge_l4',
    title: 'Static-Dynamic Mix',
    level: 4,
    days: 28,
    sortOrder: 22,
  }),
];

module.exports = { KEGEL_CHALLENGE_PROGRAMS, KEGEL_LEVEL1_CHALLENGE };
