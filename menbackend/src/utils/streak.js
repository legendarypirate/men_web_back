const { Op } = require('sequelize');
const { WorkoutSession } = require('../models');

const SESSIONS_PER_DAY = 2;

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function buildDailySessionCounts(userId, lookbackDays = 60) {
  const since = startOfDay();
  since.setDate(since.getDate() - lookbackDays);

  const sessions = await WorkoutSession.findAll({
    where: {
      userId,
      createdAt: { [Op.gte]: since },
    },
    attributes: ['createdAt'],
  });

  const countByDate = new Map();
  for (const session of sessions) {
    const key = startOfDay(session.createdAt).getTime();
    countByDate.set(key, (countByDate.get(key) || 0) + 1);
  }
  return countByDate;
}

function isDayComplete(countByDate, date) {
  const key = startOfDay(date).getTime();
  return (countByDate.get(key) || 0) >= SESSIONS_PER_DAY;
}

function computeStreakDaysFromCounts(countByDate) {
  let streak = 0;
  let cursor = startOfDay();

  if (isDayComplete(countByDate, cursor)) {
    streak = 1;
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 1);
  } else {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (isDayComplete(countByDate, cursor)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

async function countSessionsToday(userId) {
  return WorkoutSession.count({
    where: {
      userId,
      createdAt: { [Op.gte]: startOfDay() },
    },
  });
}

async function computeStreakDays(userId) {
  const countByDate = await buildDailySessionCounts(userId);
  return computeStreakDaysFromCounts(countByDate);
}

module.exports = {
  SESSIONS_PER_DAY,
  startOfDay,
  countSessionsToday,
  computeStreakDays,
  buildDailySessionCounts,
};
