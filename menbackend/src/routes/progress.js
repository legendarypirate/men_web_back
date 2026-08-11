const express = require('express');
const { Op } = require('sequelize');
const { WorkoutSession } = require('../models');
const { ok } = require('../utils/response');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const user = req.user;
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const sessions = await WorkoutSession.findAll({
      where: {
        userId: user.id,
        createdAt: { [Op.gte]: since },
      },
      order: [['createdAt', 'ASC']],
    });

    const dayKeys = ['Н', 'Д', 'М', 'Л', 'П', 'Б', 'Ш'];
    const weekly = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const daySessions = sessions.filter(
        (s) => s.createdAt.toISOString().slice(0, 10) === key
      );
      return {
        day: dayKeys[d.getDay()],
        date: key,
        sessions: daySessions.length,
        calories: daySessions.reduce((sum, s) => sum + s.calories, 0),
        completed: daySessions.length > 0,
      };
    });

    const monthSessions = await WorkoutSession.count({
      where: {
        userId: user.id,
        createdAt: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const planned = 20;
    const monthCompletion = Math.min(
      100,
      Math.round((monthSessions / planned) * 100)
    );

    return ok(res, {
      totalSessions: user.totalSessions,
      avgHoldSeconds: user.avgHoldSeconds || 102,
      longestStreak: user.longestStreak,
      streakDays: user.streakDays,
      vitalityScore: user.vitalityScore,
      activeDays: user.activeDays,
      weeklyActivity: weekly,
      targetMet: weekly.filter((d) => d.completed).length >= 5,
      monthCompletionPercent: monthCompletion,
      insight: {
        title: 'Тогтвортой өсөлт ажиглагдлаа',
        description:
          'Таны барих хугацаа сүүлийн нэг сарын турш долоо хоног бүр дунджаар 4 секундээр нэмэгдсэн байна. Та өөрийн насны ангиллын эрчүүдийн 78%-иас илүү амжилт үзүүлж байна.',
        premium: true,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
