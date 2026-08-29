const appleSignin = require('apple-signin-auth');

const DEFAULT_BUNDLE_ID = 'mn.vitalmen.mgl';

function getAppleAudience() {
  return process.env.APPLE_BUNDLE_ID || DEFAULT_BUNDLE_ID;
}

function isAppleAuthConfigured() {
  return Boolean(getAppleAudience());
}

async function verifyAppleIdentityToken(identityToken) {
  if (!identityToken) {
    const err = new Error('Apple identityToken шаардлагатай');
    err.status = 400;
    throw err;
  }

  try {
    const payload = await appleSignin.verifyIdToken(identityToken, {
      audience: getAppleAudience(),
      ignoreExpiration: false,
    });
    return payload;
  } catch (err) {
    const message = err.message || 'Apple token баталгаажуулалт амжилтгүй';
    const error = new Error(message);
    error.status = 401;
    throw error;
  }
}

module.exports = {
  isAppleAuthConfigured,
  verifyAppleIdentityToken,
  getAppleAudience,
};
