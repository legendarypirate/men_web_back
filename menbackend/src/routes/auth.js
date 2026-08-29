const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { ok, fail, publicUser } = require('../utils/response');
const { authRequired, signToken } = require('../middleware/auth');
const { verifyGoogleIdToken, isGoogleAuthConfigured } = require('../utils/googleAuth');
const { verifyAppleIdentityToken, isAppleAuthConfigured } = require('../utils/appleAuth');
const { getPaymentSettings } = require('../utils/paymentSettings');
const { enrichPublicUser } = require('../utils/membership');

const router = express.Router();

async function assertEmailLoginEnabled(res) {
  const settings = await getPaymentSettings();
  if (!settings.emailLoginEnabled) {
    fail(res, 'И-мэйл нэвтрэлт одоогоор идэвхгүй байна', 503);
    return false;
  }
  return true;
}

router.get('/config', async (req, res, next) => {
  try {
    const settings = await getPaymentSettings();
    return ok(res, {
      emailLoginEnabled: settings.emailLoginEnabled !== false,
      googleSignInConfigured: isGoogleAuthConfigured(),
      appleSignInConfigured: isAppleAuthConfigured(),
    });
  } catch (err) {
    next(err);
  }
});

async function upsertGoogleUser(payload) {
  const email = payload.email?.toLowerCase();
  if (!email) {
    const err = new Error('Google account has no email');
    err.status = 400;
    throw err;
  }

  const displayName =
    payload.name || payload.given_name || payload.family_name || 'Хэрэглэгч';

  let user = await User.findOne({ where: { email } });
  if (!user) {
    return User.create({
      email,
      name: displayName,
      avatarUrl: payload.picture || null,
      provider: 'google',
      passwordHash: null,
    });
  }

  const updates = {};
  if (!user.avatarUrl && payload.picture) updates.avatarUrl = payload.picture;
  if (user.name === 'Хэрэглэгч' && displayName !== 'Хэрэглэгч') {
    updates.name = displayName;
  }
  if (Object.keys(updates).length) {
    await user.update(updates);
  }
  return user;
}

async function upsertAppleUser(payload, profile = {}) {
  const appleSub = payload.sub;
  if (!appleSub) {
    const err = new Error('Apple account invalid');
    err.status = 400;
    throw err;
  }

  const email = (payload.email || profile.email || '').toLowerCase();
  const givenName = (profile.givenName || '').trim();
  const familyName = (profile.familyName || '').trim();
  const displayName = [givenName, familyName].filter(Boolean).join(' ').trim();

  let user = await User.findOne({ where: { provider: 'apple', providerId: appleSub } });
  if (!user && email) {
    user = await User.findOne({ where: { email } });
  }

  if (!user) {
    if (!email) {
      const err = new Error('Apple account email unavailable');
      err.status = 400;
      throw err;
    }
    return User.create({
      email,
      name: displayName || 'Хэрэглэгч',
      provider: 'apple',
      providerId: appleSub,
      passwordHash: null,
    });
  }

  const updates = {};
  if (!user.providerId) updates.providerId = appleSub;
  if (user.provider !== 'apple') updates.provider = 'apple';
  if (displayName && user.name === 'Хэрэглэгч') updates.name = displayName;
  if (Object.keys(updates).length) {
    await user.update(updates);
  }
  return user;
}

router.post('/register', async (req, res, next) => {
  try {
    if (!(await assertEmailLoginEnabled(res))) return;

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
    if (!(await assertEmailLoginEnabled(res))) return;

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

router.post('/google', async (req, res, next) => {
  try {
    if (!isGoogleAuthConfigured()) {
      return fail(res, 'Google нэвтрэлт сервер дээр тохируулаагүй байна', 503);
    }

    const { idToken } = req.body;
    if (!idToken) {
      return fail(res, 'Google idToken шаардлагатай');
    }

    const payload = await verifyGoogleIdToken(idToken);
    const user = await upsertGoogleUser(payload);
    const token = signToken(user);
    return ok(res, { token, user: publicUser(user) }, 'Google-ээр амжилттай нэвтэрлээ');
  } catch (err) {
    if (err.status) {
      return fail(res, err.message, err.status);
    }
    next(err);
  }
});

router.post('/apple', async (req, res, next) => {
  try {
    if (!isAppleAuthConfigured()) {
      return fail(res, 'Apple нэвтрэлт сервер дээр тохируулаагүй байна', 503);
    }

    const { identityToken, givenName, familyName, email } = req.body;
    if (!identityToken) {
      return fail(res, 'Apple identityToken шаардлагатай');
    }

    const payload = await verifyAppleIdentityToken(identityToken);
    const user = await upsertAppleUser(payload, { givenName, familyName, email });
    const token = signToken(user);
    return ok(res, { token, user: publicUser(user) }, 'Apple-ээр амжилттай нэвтэрлээ');
  } catch (err) {
    if (err.status) {
      return fail(res, err.message, err.status);
    }
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
  return ok(res, { user: await enrichPublicUser(req.user) });
});

module.exports = router;
