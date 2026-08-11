const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { fail, publicUser } = require('../utils/response');

async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return fail(res, 'Нэвтрэх шаардлагатай', 401);

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.sub);
    if (!user) return fail(res, 'Хэрэглэгч олдсонгүй', 401);

    req.user = user;
    req.userJson = publicUser(user);
    next();
  } catch {
    return fail(res, 'Токен хүчингүй', 401);
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) return next();
    try {
      const user = await User.findByPk(payload.sub);
      if (user) {
        req.user = user;
        req.userJson = publicUser(user);
      }
    } catch {
      // ignore
    }
    next();
  });
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
}

async function adminRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return fail(res, 'Нэвтрэх шаардлагатай', 401);

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.sub);
    if (!user) return fail(res, 'Хэрэглэгч олдсонгүй', 401);
    if (user.role !== 'admin') return fail(res, 'Админ эрх шаардлагатай', 403);

    req.user = user;
    req.userJson = publicUser(user);
    next();
  } catch {
    return fail(res, 'Токен хүчингүй', 401);
  }
}

module.exports = { authRequired, optionalAuth, adminRequired, signToken };
