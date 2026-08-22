const { WorkoutProgram, WorkoutExercise } = require('../models');
const { defaultPhasesForMotion } = require('../data/exercisePhases');
const { DEFAULT_PROGRAM_INTRO_SLIDES } = require('../data/stretchIntroSlides');

const PELVIC_STRETCHING_PRO = {
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
  introSlides: DEFAULT_PROGRAM_INTRO_SLIDES,
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
};

async function ensurePelvicStretchingProgram() {
  const { exercises, ...programData } = PELVIC_STRETCHING_PRO;
  const existing = await WorkoutProgram.findByPk(PELVIC_STRETCHING_PRO.id);

  if (!existing) {
    await WorkoutProgram.create(programData);
    for (let i = 0; i < exercises.length; i++) {
      await WorkoutExercise.create({
        ...exercises[i],
        phases: defaultPhasesForMotion(exercises[i].motion),
        programId: PELVIC_STRETCHING_PRO.id,
        sortOrder: i,
      });
    }
    console.log('Created workout program: pelvic_stretching_pro');
    return;
  }

  await existing.update({
    title: programData.title,
    description: programData.description,
    level: programData.level,
    durationMinutes: programData.durationMinutes,
    tag: programData.tag,
    sortOrder: programData.sortOrder,
  });

  const currentSlides = existing.introSlides || [];
  if (!Array.isArray(currentSlides) || currentSlides.length === 0) {
    await existing.update({ introSlides: DEFAULT_PROGRAM_INTRO_SLIDES });
  }
}

async function ensureWorkoutPrograms() {
  await ensurePelvicStretchingProgram();
}

module.exports = { ensureWorkoutPrograms, PELVIC_STRETCHING_PRO };
