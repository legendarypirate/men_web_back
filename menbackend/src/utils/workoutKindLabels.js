const { WorkoutKindLabel } = require('../models');
const { WORKOUT_KINDS } = require('./workoutKind');

const DEFAULT_KIND_LABELS = {
  kegel: 'Кегел дасгал',
  kegel_challenge: 'Кегел сорилт',
  pelvic_stretching: 'Pelvic Stretching',
  groin_fitness: 'Groin Fitness',
};

async function ensureWorkoutKindLabels() {
  await WorkoutKindLabel.sync();
  for (const kind of WORKOUT_KINDS) {
    await WorkoutKindLabel.findOrCreate({
      where: { kind },
      defaults: { title: DEFAULT_KIND_LABELS[kind] },
    });
  }
}

async function getKindLabelsMap() {
  const labels = { ...DEFAULT_KIND_LABELS };
  const rows = await WorkoutKindLabel.findAll();
  for (const row of rows) {
    const title = String(row.title || '').trim();
    if (title && Object.prototype.hasOwnProperty.call(labels, row.kind)) {
      labels[row.kind] = title;
    }
  }
  return labels;
}

function isWorkoutKind(kind) {
  return WORKOUT_KINDS.includes(kind);
}

module.exports = {
  DEFAULT_KIND_LABELS,
  ensureWorkoutKindLabels,
  getKindLabelsMap,
  isWorkoutKind,
};
