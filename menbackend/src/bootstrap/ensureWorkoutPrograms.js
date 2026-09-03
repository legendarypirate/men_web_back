const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { WorkoutProgram, WorkoutExercise } = require('../models');
const { defaultPhasesForMotion } = require('../data/exercisePhases');
const { PELVIC_STRETCHING_PROGRAMS } = require('../data/pelvicStretchingPrograms');
const { KEGEL_CHALLENGE_PROGRAMS } = require('../data/kegelChallengePrograms');
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

async function ensureWorkoutPrograms() {
  await ensureWorkoutProgramColumns();
  await backfillWorkoutKinds();

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

  const challengeCount = await WorkoutProgram.count({
    where: { kind: 'kegel_challenge' },
  });
  if (challengeCount === 0) {
    for (const program of KEGEL_CHALLENGE_PROGRAMS) {
      await ensureProgram(program);
    }
  }
}

module.exports = { ensureWorkoutPrograms, PELVIC_STRETCHING_PROGRAMS };
