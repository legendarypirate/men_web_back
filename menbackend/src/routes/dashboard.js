const express = require('express');
const { Article } = require('../models');
const { findFeaturedKegelChallenge } = require('../utils/workoutKind');
const { ok } = require('../utils/response');
const { authRequired } = require('../middleware/auth');
const {
  countSessionsToday,
  computeStreakDays,
} = require('../utils/streak');

const router = express.Router();

function greetingForHour(hour) {
  if (hour < 12) return 'Өглөөний мэнд';
  if (hour < 18) return 'Өдрийн мэнд';
  return 'Оройн мэнд';
}

router.get('/', authRequired, async (req, res, next) => {
  try {
    const user = req.user;
    const hour = new Date().getHours();

    const todayProgram = await findFeaturedKegelChallenge();

    const recommendations = await Article.findAll({
      where: { featured: false },
      order: [['createdAt', 'DESC']],
      limit: 4,
    });

    const weekDays = ['Д', 'М', 'Л', 'П', 'Б'];
    const streak = weekDays.map((day, i) => ({
      day,
      completed: i < Math.min(user.streakDays, 5),
    }));

    const sessionsToday = await countSessionsToday(user.id);
    const streakDays = await computeStreakDays(user.id);
    if (user.streakDays !== streakDays) {
      user.streakDays = streakDays;
      if (user.streakDays > user.longestStreak) {
        user.longestStreak = user.streakDays;
      }
      await user.save();
    }

    return ok(res, {
      greeting: `${greetingForHour(hour)}, ${user.name.split(' ')[0]}`,
      sectionLabel: 'ХЯНАЛТЫН САМБАР',
      user: {
        id: user.id,
        name: user.name,
        membership: user.membership,
        vitalityScore: user.vitalityScore,
        streakDays,
        sessionsToday,
      },
      streak,
      todayWorkout: todayProgram
        ? {
            id: todayProgram.id,
            title: todayProgram.title,
            description: todayProgram.description,
            level: todayProgram.level,
            durationMinutes: todayProgram.durationMinutes,
            tag: todayProgram.tag,
            readyPercent: Math.min(100, 50 + user.streakDays * 5),
          }
        : null,
      weeklyCompletion: {
        changePercent: 12,
        totalCalories: 2450,
      },
      recommendations,
      premiumCard: {
        title: 'Ахисан түвшний био-маркеруудыг нээх',
        description:
          'Өөрийн гүйцэтгэлийн профайлд илүү гүнзгий дүн шинжилгээ хийлгэхийн тулд лабораторийн шинжилгээний хариугаа холбоно уу.',
        buttonLabel: 'Лабораторитой танилцах',
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
