const WORKOUT_KINDS = [
  'kegel',
  'kegel_challenge',
  'pelvic_stretching',
  'groin_fitness',
];

const KIND_DEFAULT_TAG = {
  kegel: 'ӨНӨӨДРИЙН ДАСГАЛ',
  kegel_challenge: 'KEGEL CHALLENGE',
  pelvic_stretching: 'PELVIC STRETCHING',
  groin_fitness: 'GROIN FITNESS',
};

function inferKindFromTag(tag) {
  const value = String(tag || '').trim().toUpperCase();
  if (value === 'PELVIC STRETCHING') return 'pelvic_stretching';
  if (value === 'GROIN FITNESS') return 'groin_fitness';
  if (value === 'KEGEL CHALLENGE') return 'kegel_challenge';
  return 'kegel';
}

function normalizeKind(kind, tag) {
  if (WORKOUT_KINDS.includes(kind)) return kind;
  return inferKindFromTag(tag);
}

function workoutListWhere(query = {}) {
  const where = {};
  const tag = typeof query.tag === 'string' ? query.tag.trim() : '';
  const kind = typeof query.kind === 'string' ? query.kind.trim() : '';
  if (tag) where.tag = tag;
  if (kind) where.kind = kind;
  return Object.keys(where).length ? where : undefined;
}

function applyKindDefaults(programData = {}) {
  const kind = normalizeKind(programData.kind, programData.tag);
  const next = { ...programData, kind };

  if (kind === 'kegel_challenge') {
    next.tag = KIND_DEFAULT_TAG.kegel_challenge;
    next.challengeLevel = Number(next.challengeLevel || 1);
    next.challengeDays = Number(
      next.challengeDays || (next.challengeLevel === 1 ? 7 : 14)
    );
    if (next.challengeLevel === 1) {
      next.isLocked = false;
      next.isToday = true;
    } else {
      next.isLocked = next.isLocked !== false;
      next.isToday = false;
    }
  } else if (kind !== 'kegel') {
    next.tag = KIND_DEFAULT_TAG[kind];
    next.isToday = false;
    next.challengeLevel = null;
    next.challengeDays = null;
    next.isLocked = false;
  } else {
    if (!String(next.tag || '').trim()) {
      next.tag = KIND_DEFAULT_TAG.kegel;
    }
    next.challengeLevel = null;
    next.challengeDays = null;
    next.isLocked = false;
  }

  return next;
}

async function findFeaturedKegelChallenge() {
  const { WorkoutProgram, WorkoutExercise } = require('../models');
  const include = [{ model: WorkoutExercise, as: 'exercises' }];
  const lookups = [
    { kind: 'kegel_challenge', challengeLevel: 1 },
    { kind: 'kegel_challenge', isToday: true },
    { kind: 'kegel_challenge', isLocked: false },
    { kind: 'kegel_challenge' },
  ];

  for (const where of lookups) {
    const program = await WorkoutProgram.findOne({
      where,
      include,
      order: [
        ['challengeLevel', 'ASC'],
        ['sortOrder', 'ASC'],
        [{ model: WorkoutExercise, as: 'exercises' }, 'sortOrder', 'ASC'],
      ],
    });
    if (program) return program;
  }
  return null;
}

module.exports = {
  WORKOUT_KINDS,
  KIND_DEFAULT_TAG,
  inferKindFromTag,
  normalizeKind,
  workoutListWhere,
  applyKindDefaults,
  findFeaturedKegelChallenge,
};
