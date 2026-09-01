const express = require('express');
const { ok, fail, publicUser } = require('../utils/response');
const { authRequired } = require('../middleware/auth');
const { enrichPublicUser } = require('../utils/membership');
const { deleteUserAccount } = require('../services/deleteUserAccount');
const { DeviceToken } = require('../models');

const router = express.Router();

router.get('/profile', authRequired, async (req, res) => {
  return ok(res, { user: await enrichPublicUser(req.user) });
});

router.patch('/profile', authRequired, async (req, res, next) => {
  try {
    const allowed = [
      'name',
      'avatarUrl',
      'primaryGoal',
      'darkMode',
      'language',
      'notificationsEnabled',
      'timezone',
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) req.user[key] = req.body[key];
    }
    await req.user.save();
    return ok(res, { user: publicUser(req.user) }, 'Профайл шинэчлэгдлээ');
  } catch (err) {
    next(err);
  }
});

router.post('/goal', authRequired, async (req, res, next) => {
  try {
    const { primaryGoal } = req.body;
    if (!primaryGoal) return fail(res, 'Зорилго шаардлагатай');
    req.user.primaryGoal = primaryGoal;
    await req.user.save();
    return ok(res, { user: publicUser(req.user) }, 'Зорилго хадгалагдлаа');
  } catch (err) {
    next(err);
  }
});

router.post('/device-token', authRequired, async (req, res, next) => {
  try {
    const token = typeof req.body.token === 'string' ? req.body.token.trim() : '';
    const platform =
      typeof req.body.platform === 'string' ? req.body.platform.trim() : 'unknown';

    if (!token) return fail(res, 'FCM token шаардлагатай');

    const existing = await DeviceToken.findOne({ where: { token } });
    if (existing && existing.userId !== req.user.id) {
      await existing.update({ userId: req.user.id, platform });
    } else if (existing) {
      await existing.update({ platform });
    } else {
      await DeviceToken.create({
        userId: req.user.id,
        token,
        platform,
      });
    }

    console.log(
      `[FCM] device token saved user=${req.user.id} platform=${platform} suffix=...${token.slice(-8)}`
    );

    return ok(
      res,
      { saved: true, platform, tokenSuffix: token.slice(-8) },
      'Төхөөрөмжийн token хадгалагдлаа'
    );
  } catch (err) {
    next(err);
  }
});

router.delete('/device-token', authRequired, async (req, res, next) => {
  try {
    const token = typeof req.body.token === 'string' ? req.body.token.trim() : '';
    if (!token) return fail(res, 'FCM token шаардлагатай');

    await DeviceToken.destroy({
      where: { userId: req.user.id, token },
    });

    return ok(res, { removed: true }, 'Token устгагдлаа');
  } catch (err) {
    next(err);
  }
});

router.delete('/account', authRequired, async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return fail(res, 'Админ бүртгэлийг энэ замаар устгах боломжгүй');
    }
    if (req.body?.confirm !== true) {
      return fail(res, 'Баталгаажуулалт шаардлагатай');
    }

    await deleteUserAccount(req.user);
    return ok(res, { deleted: true }, 'Бүртгэл амжилттай устгагдлаа');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
