const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { WorkoutProgram, WorkoutExercise } = require('../models');
const { defaultPhasesForMotion } = require('../data/exercisePhases');
const { PELVIC_STRETCHING_PROGRAMS } = require('../data/pelvicStretchingPrograms');
const { KEGEL_CHALLENGE_PROGRAMS, KEGEL_LEVEL1_CHALLENGE } = require('../data/kegelChallengePrograms');
const { inferKindFromTag } = require('../utils/workoutKind');

async function ensureColumn(table, name, spec) {
  const desc = await sequelize.getQueryInterface().describeTable(table);
  if (desc[name]) return;
  await sequelize.getQueryInterface().addColumn(table, name, spec);
  console.log(`Added ${table}.${name}`);
}

async function ensureWorkoutProgramColumns() {
  await ensureColumn('workout_programs', 'kind', {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'kegel',
  });
  await ensureColumn('workout_programs', 'is_locked', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
  await ensureColumn('workout_programs', 'challenge_level', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });
  await ensureColumn('workout_programs', 'challenge_days', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });
  await ensureColumn('workout_exercises', 'avatar_images', {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  });
}

async function backfillWorkoutKinds() {
  const programs = await WorkoutProgram.findAll({
    attributes: ['id', 'tag', 'kind'],
  });
  for (const program of programs) {
    const inferred = inferKindFromTag(program.tag);
    const shouldSet =
      !program.kind || (program.kind === 'kegel' && inferred !== 'kegel');
    if (shouldSet && program.kind !== inferred) {
      await program.update({ kind: inferred });
    }
  }
}

async function ensureProgram(definition) {
  const { exercises, ...programData } = definition;
  const existing = await WorkoutProgram.findByPk(definition.id);

  if (!existing) {
    await WorkoutProgram.create({
      ...programData,
      kind: programData.kind || inferKindFromTag(programData.tag),
    });
    for (let i = 0; i < exercises.length; i++) {
      await WorkoutExercise.create({
        ...exercises[i],
        phases: exercises[i].phases || defaultPhasesForMotion(exercises[i].motion),
        programId: definition.id,
        sortOrder: i,
      });
    }
    console.log(`Created workout program: ${definition.id}`);
  }
}

async function migrateKegelProgramsToChallenges() {
  const existing = await WorkoutProgram.findAll({
    where: { kind: 'kegel_challenge' },
    attributes: ['id', 'challengeLevel'],
  });
  const usedLevels = new Set(
    existing.map((item) => item.challengeLevel).filter((level) => level != null)
  );

  const kegelPrograms = await WorkoutProgram.findAll({
    where: { kind: 'kegel' },
    order: [
      ['isToday', 'DESC'],
      ['sortOrder', 'ASC'],
    ],
  });

  let nextLevel = 2;
  while (usedLevels.has(nextLevel)) nextLevel += 1;
  let hasLevel1 = usedLevels.has(1);

  for (const program of kegelPrograms) {
    const preferLevel1 =
      !hasLevel1 &&
      (program.isToday || /анхан/i.test(program.title || ''));

    if (preferLevel1) {
      await program.update({
        kind: 'kegel_challenge',
        challengeLevel: 1,
        challengeDays: program.challengeDays || 7,
        isLocked: false,
        isToday: true,
        tag: 'KEGEL CHALLENGE',
        title: /анхан/i.test(program.title || '')
          ? program.title
          : 'Анхан шатны кегел дасгал',
      });
      hasLevel1 = true;
      usedLevels.add(1);
      continue;
    }

    await program.update({
      kind: 'kegel_challenge',
      challengeLevel: nextLevel,
      challengeDays: program.challengeDays || 14,
        isLocked: false,
      isToday: false,
      tag: 'KEGEL CHALLENGE',
    });
    usedLevels.add(nextLevel);
    nextLevel += 1;
    while (usedLevels.has(nextLevel)) nextLevel += 1;
  }

  return hasLevel1;
}

async function ensureWorkoutPrograms() {
  await ensureWorkoutProgramColumns();
  await backfillWorkoutKinds();
  const hasLevel1 = await migrateKegelProgramsToChallenges();

  const pelvicCount = await WorkoutProgram.count({
    where: { kind: 'pelvic_stretching' },
  });
  if (pelvicCount === 0) {
    for (const program of PELVIC_STRETCHING_PROGRAMS) {
      await ensureProgram({
        ...program,
        kind: 'pelvic_stretching',
      });
    }
  }

  if (!hasLevel1) {
    const level1 = await WorkoutProgram.findOne({
      where: { kind: 'kegel_challenge', challengeLevel: 1 },
    });
    if (!level1) {
      await ensureProgram(KEGEL_LEVEL1_CHALLENGE);
    }
  }

  for (const program of KEGEL_CHALLENGE_PROGRAMS.filter(
    (item) => item.challengeLevel !== 1
  )) {
    await ensureProgram(program);
  }
}

module.exports = { ensureWorkoutPrograms, PELVIC_STRETCHING_PROGRAMS };
