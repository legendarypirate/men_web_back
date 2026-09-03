const { Op } = require('sequelize');
const { WorkoutProgram, WorkoutSession } = require('../models');
const { resolveTimezone, dateKeyInTimezone } = require('./timezone');

const KEGEL_UNLOCK_DAYS = 7;

async function completedDaysByProgramId(userId, programIds, timezone) {
  const daysByProgram = new Map();
  if (!userId || !programIds.length) return daysByProgram;

  const sessions = await WorkoutSession.findAll({
    where: {
      userId,
      programId: { [Op.in]: programIds },
      earlyFinish: false,
    },
    attributes: ['programId', 'createdAt'],
  });

  for (const session of sessions) {
    const day = dateKeyInTimezone(timezone, session.createdAt);
    if (!daysByProgram.has(session.programId)) {
      daysByProgram.set(session.programId, new Set());
    }
    daysByProgram.get(session.programId).add(day);
  }

  const counts = new Map();
  for (const [programId, days] of daysByProgram) {
    counts.set(programId, days.size);
  }
  return counts;
}

function applyUnlocksToPrograms(programs, completedDays) {
  const challenges = programs
    .filter((program) => program.kind === 'kegel_challenge')
    .slice()
    .sort(
      (a, b) => (a.challengeLevel || 1) - (b.challengeLevel || 1)
    );

  const byLevel = new Map();
  for (const challenge of challenges) {
    const level = challenge.challengeLevel || 1;
    if (!byLevel.has(level)) byLevel.set(level, challenge);
  }
  const levels = [...byLevel.keys()].sort((a, b) => a - b);

  for (const program of programs) {
    if (program.kind !== 'kegel_challenge') continue;

    const level = program.challengeLevel || 1;
    const ownDays = completedDays.get(program.id) || 0;
    program.completedDays = ownDays;
    program.unlockDays = KEGEL_UNLOCK_DAYS;
    program.unlockFromTitle = '';
    program.previousCompletedDays = 0;
    program.unlockRemainingDays = 0;

    const prevLevel = [...levels].reverse().find((item) => item < level);
    const previous = prevLevel != null ? byLevel.get(prevLevel) : null;

    if (!previous) {
      program.isLocked = false;
      continue;
    }

    const previousDays = completedDays.get(previous.id) || 0;
    program.unlockFromTitle = previous.title || '';
    program.previousCompletedDays = previousDays;
    program.unlockRemainingDays = Math.max(0, KEGEL_UNLOCK_DAYS - previousDays);
    program.isLocked = previousDays < KEGEL_UNLOCK_DAYS;
  }

  return programs;
}

async function applyKegelProgress(programs, user) {
  const targetIds = programs
    .filter((program) => program.kind === 'kegel_challenge')
    .map((program) => program.id);
  if (!targetIds.length) return programs;

  const challenges = await WorkoutProgram.findAll({
    where: { kind: 'kegel_challenge' },
    attributes: ['id', 'title', 'kind', 'challengeLevel'],
    order: [['challengeLevel', 'ASC']],
  });
  const graph = challenges.map((item) => ({
    id: item.id,
    title: item.title,
    kind: 'kegel_challenge',
    challengeLevel: item.challengeLevel || 1,
    isLocked: false,
  }));

  const completedDays = user
    ? await completedDaysByProgramId(
        user.id,
        graph.map((item) => item.id),
        resolveTimezone(user)
      )
    : new Map();

  applyUnlocksToPrograms(graph, completedDays);
  const byId = new Map(graph.map((item) => [item.id, item]));

  for (const program of programs) {
    const progress = byId.get(program.id);
    if (!progress) continue;
    program.isLocked = progress.isLocked;
    program.completedDays = progress.completedDays;
    program.unlockDays = progress.unlockDays;
    program.previousCompletedDays = progress.previousCompletedDays;
    program.unlockRemainingDays = progress.unlockRemainingDays;
    program.unlockFromTitle = progress.unlockFromTitle;
  }

  return programs;
}

async function isKegelChallengeLockedForUser(user, programId) {
  const program = await WorkoutProgram.findByPk(programId, {
    attributes: ['id', 'kind'],
  });
  if (!program || program.kind !== 'kegel_challenge') return false;

  const mapped = [
    {
      id: program.id,
      kind: 'kegel_challenge',
      isLocked: false,
    },
  ];
  await applyKegelProgress(mapped, user);
  return Boolean(mapped[0].isLocked);
}

module.exports = {
  KEGEL_UNLOCK_DAYS,
  applyKegelProgress,
  isKegelChallengeLockedForUser,
};
