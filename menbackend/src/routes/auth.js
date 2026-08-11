const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { ok, fail, publicUser } = require('../utils/response');
const { authRequired, signToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return fail(res, 'И-мэйл болон нууц үг шаардлагатай');
    }

    const exists = await User.findOne({ where: { email: email.toLowerCase() } });
    if (exists) return fail(res, 'И-мэйл бүртгэлтэй байна', 409);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name: name || 'Хэрэглэгч',
      provider: 'email',
    });

    const token = signToken(user);
    return ok(
      res,
      { token, user: publicUser(user) },
      'Бүртгэл амжилттай',
      201
    );
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return fail(res, 'И-мэйл болон нууц үг шаардлагатай');
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user || !user.passwordHash) {
      return fail(res, 'И-мэйл эсвэл нууц үг буруу', 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return fail(res, 'И-мэйл эсвэл нууц үг буруу', 401);

    const token = signToken(user);
    return ok(res, { token, user: publicUser(user) }, 'Амжилттай нэвтэрлээ');
  } catch (err) {
    next(err);
  }
});

router.post('/social', async (req, res, next) => {
  try {
    const { provider, email, name, providerId } = req.body;
    if (!provider || !email) {
      return fail(res, 'provider болон email шаардлагатай');
    }

    let user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
        name: name || 'Хэрэглэгч',
        provider: provider,
        passwordHash: null,
      });
    }

    const token = signToken(user);
    return ok(res, {
      token,
      user: publicUser(user),
      providerId: providerId || null,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authRequired, async (req, res) => {
  return ok(res, { user: req.userJson });
});

module.exports = router;
