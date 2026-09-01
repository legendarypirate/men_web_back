const { Op } = require('sequelize');
const { User, DeviceToken } = require('../models');
const { isFcmConfigured, sendToTokens, getFcmStatus } = require('./fcm');

async function getPushStats() {
  const tokenRows = await DeviceToken.findAll({
    attributes: ['userId', 'token', 'platform', 'updatedAt', 'createdAt'],
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['email', 'name'],
      },
    ],
    order: [['updatedAt', 'DESC']],
  });
  const userIds = new Set(tokenRows.map((row) => row.userId));
  const fcmStatus = getFcmStatus();

  return {
    fcmConfigured: isFcmConfigured(),
    fcmInitError: fcmStatus.error,
    credentialsPath: fcmStatus.credentialsPath,
    registeredDevices: tokenRows.length,
    usersWithTokens: userIds.size,
    iosDevices: tokenRows.filter((row) => row.platform === 'ios').length,
    androidDevices: tokenRows.filter((row) => row.platform === 'android').length,
    devices: tokenRows.map((row) => ({
      userId: row.userId,
      userEmail: row.user?.email || null,
      userName: row.user?.name || null,
      platform: row.platform,
      tokenSuffix: row.token.slice(-8),
      updatedAt: row.updatedAt,
    })),
  };
}

async function resolveTargetUserIds({ target = 'all', userId, membership }) {
  const where = {
    role: { [Op.ne]: 'admin' },
    notificationsEnabled: true,
  };

  if (target === 'user') {
    if (!userId) {
      const err = new Error('Хэрэглэгчийн ID шаардлагатай');
      err.statusCode = 400;
      throw err;
    }
    where.id = userId;
  } else if (membership) {
    where.membership = membership;
  }

  const users = await User.findAll({
    where,
    attributes: ['id'],
  });
  return users.map((user) => user.id);
}

async function sendAdminPush({
  title,
  body,
  data = {},
  target = 'all',
  userId,
  membership,
}) {
  if (!isFcmConfigured()) {
    const { error } = getFcmStatus();
    const err = new Error(
      error ||
        'FCM тохиргоо хийгдээгүй байна (FIREBASE_SERVICE_ACCOUNT_JSON эсвэл FIREBASE_SERVICE_ACCOUNT_PATH)'
    );
    err.statusCode = 503;
    throw err;
  }

  const trimmedTitle = String(title || '').trim();
  const trimmedBody = String(body || '').trim();
  if (!trimmedTitle || !trimmedBody) {
    const err = new Error('Гарчиг болон мессеж шаардлагатай');
    err.statusCode = 400;
    throw err;
  }

  const userIds = await resolveTargetUserIds({ target, userId, membership });
  if (!userIds.length) {
    return {
      sent: 0,
      failed: 0,
      recipientCount: 0,
      tokenCount: 0,
      fcmConfigured: true,
      errors: [],
    };
  }

  const tokenRows = await DeviceToken.findAll({
    where: { userId: { [Op.in]: userIds } },
    attributes: ['token', 'platform'],
  });

  const payloadData = {
    type: 'admin_broadcast',
    ...Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value)])
    ),
  };

  const result = await sendToTokens(tokenRows, {
    title: trimmedTitle,
    body: trimmedBody,
    data: payloadData,
  });

  return {
    sent: result.sent,
    failed: result.failed,
    errors: result.errors || [],
    recipientCount: userIds.length,
    tokenCount: tokenRows.length,
    fcmConfigured: true,
  };
}

module.exports = {
  getPushStats,
  sendAdminPush,
};
