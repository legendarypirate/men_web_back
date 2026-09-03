const express = require('express');
const {
  WorkoutProgram,
  WorkoutExercise,
  WorkoutSession,
} = require('../models');
const { ok, fail } = require('../utils/response');
const { authRequired, optionalAuth } = require('../middleware/auth');
const {
  SESSIONS_PER_DAY,
  countSessionsToday,
  computeStreakDays,
} = require('../utils/streak');
const { onWorkoutSessionSaved } = require('../services/workoutReminders');
const { hasActivePremium, syncUserMembership } = require('../utils/membership');
const { findFeaturedKegelChallenge, workoutListWhere, shareKegelChallengeWorkoutFromLevel1, isKegelLevel1 } = require('../utils/workoutKind');
const {
  applyKegelProgress,
  isKegelChallengeLockedForUser,
} = require('../utils/kegelProgress');

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
      targetMuscles: e.targetMuscles || null,
      videoUrl: e.videoUrl || null,
      thumbnailUrl: e.thumbnailUrl || null,
      introSlides: (e.introSlides || []).sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      ),
      phases: (e.phases || []).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
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
    equipment: json.equipment || 'None',
    tag: json.tag,
    kind: json.kind || 'kegel',
    isToday: json.isToday,
    isLocked: false,
    challengeLevel: json.challengeLevel ?? null,
    challengeDays: json.challengeDays ?? null,
    completedDays: 0,
    unlockDays: 7,
    previousCompletedDays: 0,
    unlockRemainingDays: 0,
    unlockFromTitle: '',
    videoUrl: json.videoUrl || null,
    thumbnailUrl: json.thumbnailUrl || null,
    introSlides: (json.introSlides || []).sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    ),
    levelPresets: json.levelPresets || {},
    exercises,
    totalSets,
    totalSeconds,
  };
}

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const where = workoutListWhere(req.query);
    const programs = await WorkoutProgram.findAll({
      where,
      include: [{ model: WorkoutExercise, as: 'exercises' }],
      order: [
        ['sortOrder', 'ASC'],
        [{ model: WorkoutExercise, as: 'exercises' }, 'sortOrder', 'ASC'],
      ],
    });
    const mapped = shareKegelChallengeWorkoutFromLevel1(programs.map(mapProgram));
    await applyKegelProgress(mapped, req.user);
    return ok(res, { programs: mapped });
  } catch (err) {
    next(err);
  }
});

router.get('/today', optionalAuth, async (req, res, next) => {
  try {
    const program = await findFeaturedKegelChallenge();
    if (!program) return fail(res, 'Дасгал олдсонгүй', 404);
    const mapped = [mapProgram(program)];
    await applyKegelProgress(mapped, req.user);
    return ok(res, { program: mapped[0] });
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
    await syncUserMembership(req.user);
    if (!hasActivePremium(req.user)) {
      return fail(res, 'Premium эрх шаардлагатай', 403);
    }

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

    if (await isKegelChallengeLockedForUser(req.user, programId)) {
      return fail(res, 'Өмнөх түвшинг 7 хоног хийсний дараа нээгдэнэ', 403);
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

    const sessionsToday = await countSessionsToday(user.id);
    if (sessionsToday === SESSIONS_PER_DAY) {
      user.activeDays += 1;
    }

    const streakDays = await computeStreakDays(user.id);
    user.streakDays = streakDays;
    if (user.streakDays > user.longestStreak) {
      user.longestStreak = user.streakDays;
    }
    user.vitalityScore = Math.min(100, user.vitalityScore + 1);
    await user.save();

    await onWorkoutSessionSaved(user, session.id);

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
          sessionsToday,
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
    let mapped = mapProgram(program);
    if (mapped.kind === 'kegel_challenge' && !isKegelLevel1(mapped)) {
      const level1 = await findFeaturedKegelChallenge();
      if (level1) {
        mapped =
          shareKegelChallengeWorkoutFromLevel1([mapProgram(level1), mapped]).find(
            (item) => item.id === mapped.id
          ) || mapped;
      }
    }
    const withProgress = [mapped];
    await applyKegelProgress(withProgress, req.user);
    return ok(res, { program: withProgress[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
