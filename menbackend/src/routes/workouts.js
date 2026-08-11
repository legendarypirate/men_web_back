const express = require('express');
const {
  WorkoutProgram,
  WorkoutExercise,
  WorkoutSession,
} = require('../models');
const { ok, fail } = require('../utils/response');
const { authRequired, optionalAuth } = require('../middleware/auth');

const router = express.Router();

function mapProgram(program) {
  const json = program.toJSON();
  const exercises = (json.exercises || [])
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category,
      instruction: e.instruction,
      durationSeconds: e.durationSeconds,
      sets: e.sets,
      motion: e.motion,
      motionHint: e.motionHint,
      videoUrl: e.videoUrl || null,
      thumbnailUrl: e.thumbnailUrl || null,
    }));

  const totalSets = exercises.reduce((s, e) => s + e.sets, 0);
  const totalSeconds = exercises.reduce(
    (s, e) => s + e.durationSeconds * e.sets,
    0
  );

  return {
    id: json.id,
    title: json.title,
    description: json.description,
    level: json.level,
    durationMinutes: json.durationMinutes,
    tag: json.tag,
    isToday: json.isToday,
    exercises,
    totalSets,
    totalSeconds,
  };
}

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const programs = await WorkoutProgram.findAll({
      include: [{ model: WorkoutExercise, as: 'exercises' }],
      order: [
        ['sortOrder', 'ASC'],
        [{ model: WorkoutExercise, as: 'exercises' }, 'sortOrder', 'ASC'],
      ],
    });
    return ok(res, { programs: programs.map(mapProgram) });
  } catch (err) {
    next(err);
  }
});

router.get('/today', optionalAuth, async (req, res, next) => {
  try {
    let program = await WorkoutProgram.findOne({
      where: { isToday: true },
      include: [{ model: WorkoutExercise, as: 'exercises' }],
      order: [[{ model: WorkoutExercise, as: 'exercises' }, 'sortOrder', 'ASC']],
    });
    if (!program) {
      program = await WorkoutProgram.findOne({
        include: [{ model: WorkoutExercise, as: 'exercises' }],
        order: [
          ['sortOrder', 'ASC'],
          [{ model: WorkoutExercise, as: 'exercises' }, 'sortOrder', 'ASC'],
        ],
      });
    }
    if (!program) return fail(res, 'Дасгал олдсонгүй', 404);
    return ok(res, { program: mapProgram(program) });
  } catch (err) {
    next(err);
  }
});

router.get('/sessions/mine', authRequired, async (req, res, next) => {
  try {
    const sessions = await WorkoutSession.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    return ok(res, { sessions });
  } catch (err) {
    next(err);
  }
});

router.post('/sessions', authRequired, async (req, res, next) => {
  try {
    const {
      programId,
      programTitle,
      durationSeconds,
      calories,
      completedSets,
      totalSets,
      consistencyPercent,
      earlyFinish,
    } = req.body;

    if (!programId || durationSeconds == null || completedSets == null) {
      return fail(res, 'Шаардлагатай талбарууд дутуу');
    }

    const session = await WorkoutSession.create({
      userId: req.user.id,
      programId,
      programTitle: programTitle || programId,
      durationSeconds: Number(durationSeconds),
      calories: Number(calories || 0),
      completedSets: Number(completedSets),
      totalSets: Number(totalSets || completedSets),
      consistencyPercent: Number(consistencyPercent || 0),
      earlyFinish: Boolean(earlyFinish),
    });

    const user = req.user;
    user.totalSessions += 1;
    user.activeDays += 1;
    user.streakDays += 1;
    if (user.streakDays > user.longestStreak) {
      user.longestStreak = user.streakDays;
    }
    user.vitalityScore = Math.min(100, user.vitalityScore + 1);
    await user.save();

    return ok(
      res,
      {
        session,
        result: {
          programTitle: session.programTitle,
          durationSeconds: session.durationSeconds,
          calories: session.calories,
          completedSets: session.completedSets,
          totalSets: session.totalSets,
          consistencyPercent: session.consistencyPercent,
        },
        userStats: {
          totalSessions: user.totalSessions,
          streakDays: user.streakDays,
          longestStreak: user.longestStreak,
          vitalityScore: user.vitalityScore,
          activeDays: user.activeDays,
        },
      },
      'Дасгал хадгалагдлаа',
      201
    );
  } catch (err) {
    next(err);
  }
});

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const program = await WorkoutProgram.findByPk(req.params.id, {
      include: [{ model: WorkoutExercise, as: 'exercises' }],
      order: [[{ model: WorkoutExercise, as: 'exercises' }, 'sortOrder', 'ASC']],
    });
    if (!program) return fail(res, 'Дасгал олдсонгүй', 404);
    return ok(res, { program: mapProgram(program) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
