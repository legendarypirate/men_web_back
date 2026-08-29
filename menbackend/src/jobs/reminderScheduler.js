const cron = require('node-cron');
const { processWorkoutReminders } = require('../services/workoutReminders');
const { initFirebaseAdmin } = require('../services/fcm');

let started = false;

function startReminderScheduler() {
  if (started) return;
  started = true;

  initFirebaseAdmin();

  cron.schedule('* * * * *', async () => {
    try {
      await processWorkoutReminders();
    } catch (err) {
      console.error('[Reminders] scheduler error:', err);
    }
  });

  console.log('[Reminders] Workout reminder scheduler started (every minute)');
}

module.exports = { startReminderScheduler };
