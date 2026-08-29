let admin = null;
let messaging = null;
let initialized = false;

function initFirebaseAdmin() {
  if (initialized) return messaging;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!json && !path) {
    initialized = true;
    return null;
  }

  try {
    // eslint-disable-next-line global-require
    admin = require('firebase-admin');

    if (admin.apps.length === 0) {
      if (json) {
        const credentials = JSON.parse(json);
        admin.initializeApp({ credential: admin.credential.cert(credentials) });
      } else {
        // eslint-disable-next-line global-require
        const serviceAccount = require(path);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      }
    }

    messaging = admin.messaging();
    console.log('[FCM] Firebase Admin initialized');
  } catch (err) {
    console.warn('[FCM] Firebase Admin init failed:', err.message);
    messaging = null;
  }

  initialized = true;
  return messaging;
}

function isFcmConfigured() {
  return initFirebaseAdmin() != null;
}

async function sendToTokens(tokens, { title, body, data = {} }) {
  const fcm = initFirebaseAdmin();
  if (!fcm || !tokens.length) return { sent: 0, failed: tokens.length };

  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  if (!uniqueTokens.length) return { sent: 0, failed: 0 };

  const payload = {
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value)])
    ),
    android: {
      priority: 'high',
      notification: { channelId: 'workout_reminders' },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
        },
      },
    },
  };

  let sent = 0;
  let failed = 0;

  for (const token of uniqueTokens) {
    try {
      await fcm.send({ token, ...payload });
      sent += 1;
    } catch (err) {
      failed += 1;
      if (
        err.code === 'messaging/registration-token-not-registered' ||
        err.code === 'messaging/invalid-registration-token'
      ) {
        // eslint-disable-next-line global-require
        const { DeviceToken } = require('../models');
        await DeviceToken.destroy({ where: { token } }).catch(() => {});
      }
      console.warn('[FCM] send failed:', err.code || err.message);
    }
  }

  return { sent, failed };
}

module.exports = {
  initFirebaseAdmin,
  isFcmConfigured,
  sendToTokens,
};
