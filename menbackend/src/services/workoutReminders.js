const { Op } = require('sequelize');
const {
  User,
  DeviceToken,
  ScheduledReminder,
  NotificationLog,
  WorkoutSession,
} = require('../models');
const { SESSIONS_PER_DAY } = require('../utils/streak');
const {
  resolveTimezone,
  startOfDayUtc,
  dateKeyInTimezone,
  isExactLocalTime,
} = require('../utils/timezone');
const { sendToTokens } = require('./fcm');

const PARTIAL_REMINDER_TYPE = 'partial_complete';
const PARTIAL_REMINDER_DELAY_MS = 2 * 60 * 60 * 1000;
const PARTIAL_REMINDER_TITLE = 'Tenkhee';
const PARTIAL_REMINDER_BODY = 'Та үлдсэн 1 дасгалаа гүйцээнэ үү';

const DAILY_REMINDER_HOURS = [11, 12, 13];
const DAILY_REMINDER_TITLE = 'Tenkhee';
const DAILY_REMINDER_BODY = 'Өнөөдрийн дасгалаа эхлүүлээрэй';

async function countSessionsToday(userId, timezone) {
  const dayStart = startOfDayUtc(timezone);
  return WorkoutSession.count({
    where: {
      userId,
      createdAt: { [Op.gte]: dayStart },
    },
  });
}

async function getUserTokens(userId) {
  const rows = await DeviceToken.findAll({
    where: { userId },
    attributes: ['token'],
  });
  return rows.map((row) => row.token);
}

async function logNotification(userId, reminderKey, title, body) {
  await NotificationLog.create({
    userId,
    reminderKey,
    title,
    body,
  });
}

async function hasNotificationLog(userId, reminderKey) {
  const existing = await NotificationLog.findOne({
    where: { userId, reminderKey },
  });
  return Boolean(existing);
}

async function cancelPendingPartialReminders(userId) {
  await ScheduledReminder.update(
    { cancelled: true },
    {
      where: {
        userId,
        type: PARTIAL_REMINDER_TYPE,
        sent: false,
        cancelled: false,
      },
    }
  );
}

async function schedulePartialReminder(userId, sessionId) {
  await cancelPendingPartialReminders(userId);

  const scheduledFor = new Date(Date.now() + PARTIAL_REMINDER_DELAY_MS);
  await ScheduledReminder.create({
    userId,
    type: PARTIAL_REMINDER_TYPE,
    scheduledFor,
    sessionId,
  });
}

async function onWorkoutSessionSaved(user, sessionId) {
  if (!user.notificationsEnabled) return;

  const timezone = resolveTimezone(user);
  const sessionsToday = await countSessionsToday(user.id, timezone);

  if (sessionsToday === 1) {
    await schedulePartialReminder(user.id, sessionId);
    return;
  }

  if (sessionsToday >= SESSIONS_PER_DAY) {
    await cancelPendingPartialReminders(user.id);
  }
}

async function sendReminderToUser(user, { title, body, data, reminderKey }) {
  if (!user.notificationsEnabled) return false;

  const alreadySent = await hasNotificationLog(user.id, reminderKey);
  if (alreadySent) return false;

  const tokens = await getUserTokens(user.id);
  if (!tokens.length) return false;

  const result = await sendToTokens(tokens, { title, body, data });
  if (result.sent > 0) {
    await logNotification(user.id, reminderKey, title, body);
    return true;
  }
  return false;
}

async function processDuePartialReminders() {
  const due = await ScheduledReminder.findAll({
    where: {
      type: PARTIAL_REMINDER_TYPE,
      sent: false,
      cancelled: false,
      scheduledFor: { [Op.lte]: new Date() },
    },
    include: [{ model: User, as: 'user' }],
    limit: 100,
  });

  for (const reminder of due) {
    const user = reminder.user;
    if (!user || !user.notificationsEnabled) {
      await reminder.update({ cancelled: true });
      continue;
    }

    const timezone = resolveTimezone(user);
    const sessionsToday = await countSessionsToday(user.id, timezone);

    if (sessionsToday !== 1) {
      await reminder.update({ cancelled: true });
      continue;
    }

    const dateKey = dateKeyInTimezone(timezone);
    const reminderKey = `partial_${dateKey}_${reminder.id}`;

    const tokens = await getUserTokens(user.id);
    if (!tokens.length) {
      await reminder.update({ cancelled: true });
      continue;
    }

    const sent = await sendReminderToUser(user, {
      title: PARTIAL_REMINDER_TITLE,
      body: PARTIAL_REMINDER_BODY,
      data: { type: 'partial_complete' },
      reminderKey,
    });

    if (sent) {
      await reminder.update({ sent: true });
    }
  }
}

async function processDailyRemindersForHour(hour) {
  const users = await User.findAll({
    where: { notificationsEnabled: true },
    attributes: ['id', 'notificationsEnabled', 'timezone'],
  });

  for (const user of users) {
    const timezone = resolveTimezone(user);
    if (!isExactLocalTime(timezone, hour, 0)) continue;

    const sessionsToday = await countSessionsToday(user.id, timezone);
    if (sessionsToday > 0) continue;

    const dateKey = dateKeyInTimezone(timezone);
    const reminderKey = `daily_${hour}_${dateKey}`;

    await sendReminderToUser(user, {
      title: DAILY_REMINDER_TITLE,
      body: DAILY_REMINDER_BODY,
      data: { type: 'daily_reminder', hour: String(hour) },
      reminderKey,
    });
  }
}

async function processWorkoutReminders() {
  await processDuePartialReminders();

  for (const hour of DAILY_REMINDER_HOURS) {
    await processDailyRemindersForHour(hour);
  }
}

module.exports = {
  onWorkoutSessionSaved,
  processWorkoutReminders,
  schedulePartialReminder,
  cancelPendingPartialReminders,
  countSessionsToday,
};
