const express = require('express');
const { ok, fail, publicUser } = require('../utils/response');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authRequired, async (req, res) => {
  return ok(res, { user: req.userJson });
});

router.patch('/profile', authRequired, async (req, res, next) => {
  try {
    const allowed = [
      'name',
      'avatarUrl',
      'primaryGoal',
      'darkMode',
      'language',
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

module.exports = router;
