const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..', '..');

let admin = null;
let messaging = null;
let initialized = false;
let lastInitError = null;
let resolvedCredentialsPath = null;

function trimEnv(value) {
  if (value == null) return '';
  return String(value).trim().replace(/^['"]|['"]$/g, '');
}

function resolveServiceAccountPath(configPath) {
  const trimmed = trimEnv(configPath);
  if (!trimmed) return null;
  if (path.isAbsolute(trimmed)) return trimmed;
  return path.resolve(projectRoot, trimmed);
}

function loadServiceAccountCredentials() {
  const inlineJson = trimEnv(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  if (inlineJson) {
    try {
      resolvedCredentialsPath = '(inline FIREBASE_SERVICE_ACCOUNT_JSON)';
      return JSON.parse(inlineJson);
    } catch (err) {
      lastInitError = `FIREBASE_SERVICE_ACCOUNT_JSON parse failed: ${err.message}`;
      return null;
    }
  }

  const configuredPath = trimEnv(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  if (!configuredPath) {
    lastInitError =
      'FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH is not set';
    return null;
  }

  resolvedCredentialsPath = resolveServiceAccountPath(configuredPath);
  if (!fs.existsSync(resolvedCredentialsPath)) {
    lastInitError = `Service account file not found: ${resolvedCredentialsPath}`;
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(resolvedCredentialsPath, 'utf8'));
  } catch (err) {
    lastInitError = `Failed to read ${resolvedCredentialsPath}: ${err.message}`;
    return null;
  }
}

function initFirebaseAdmin() {
  if (initialized) return messaging;

  const credentials = loadServiceAccountCredentials();
  if (!credentials) {
    initialized = true;
    return null;
  }

  try {
    // eslint-disable-next-line global-require
    admin = require('firebase-admin');

    if (admin.apps.length === 0) {
      admin.initializeApp({ credential: admin.credential.cert(credentials) });
    }

    messaging = admin.messaging();
    lastInitError = null;
    console.log('[FCM] Firebase Admin initialized');
    if (resolvedCredentialsPath) {
      console.log(`[FCM] Credentials loaded from: ${resolvedCredentialsPath}`);
    }
  } catch (err) {
    lastInitError = err.message;
    console.warn('[FCM] Firebase Admin init failed:', err.message);
    messaging = null;
  }

  initialized = true;
  return messaging;
}

function isFcmConfigured() {
  return initFirebaseAdmin() != null;
}

function getFcmStatus() {
  initFirebaseAdmin();
  return {
    configured: messaging != null,
    error: lastInitError,
    credentialsPath: resolvedCredentialsPath,
    projectRoot,
  };
}

async function sendToTokens(tokens, { title, body, data = {} }) {
  const fcm = initFirebaseAdmin();
  if (!fcm || !tokens.length) return { sent: 0, failed: tokens.length };

  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  if (!uniqueTokens.length) return { sent: 0, failed: 0 };

  const payload = {
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries({ ...data, title, body }).map(([key, value]) => [
        key,
        String(value),
      ])
    ),
    android: {
      priority: 'high',
      notification: { channelId: 'workout_reminders' },
    },
    apns: {
      headers: {
        'apns-priority': '10',
      },
      payload: {
        aps: {
          alert: {
            title,
            body,
          },
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
  getFcmStatus,
  sendToTokens,
};
