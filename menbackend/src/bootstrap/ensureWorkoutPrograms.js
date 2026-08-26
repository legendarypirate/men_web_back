const { WorkoutProgram, WorkoutExercise } = require('../models');
const { defaultPhasesForMotion } = require('../data/exercisePhases');
const { PELVIC_STRETCHING_PROGRAMS } = require('../data/pelvicStretchingPrograms');

async function ensureProgram(definition) {
  const { exercises, ...programData } = definition;
  const existing = await WorkoutProgram.findByPk(definition.id);

  if (!existing) {
    await WorkoutProgram.create(programData);
    for (let i = 0; i < exercises.length; i++) {
      await WorkoutExercise.create({
        ...exercises[i],
        phases: defaultPhasesForMotion(exercises[i].motion),
        programId: definition.id,
        sortOrder: i,
      });
    }
    console.log(`Created workout program: ${definition.id}`);
    return;
  }

  await existing.update({
    title: programData.title,
    description: programData.description,
    level: programData.level,
    durationMinutes: programData.durationMinutes,
    equipment: programData.equipment,
    tag: programData.tag,
    sortOrder: programData.sortOrder,
  });

  const currentSlides = existing.introSlides || [];
  if (!Array.isArray(currentSlides) || currentSlides.length === 0) {
    await existing.update({ introSlides: programData.introSlides });
  }
}

async function ensureWorkoutPrograms() {
  for (const program of PELVIC_STRETCHING_PROGRAMS) {
    await ensureProgram(program);
  }
}

module.exports = { ensureWorkoutPrograms, PELVIC_STRETCHING_PROGRAMS };
