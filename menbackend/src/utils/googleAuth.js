const { OAuth2Client } = require('google-auth-library');

function getGoogleClientIds() {
  const raw = process.env.GOOGLE_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID || '';
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function isGoogleAuthConfigured() {
  return getGoogleClientIds().length > 0;
}

async function verifyGoogleIdToken(idToken) {
  const clientIds = getGoogleClientIds();
  if (!clientIds.length) {
    const err = new Error('Google auth is not configured on the server');
    err.status = 503;
    throw err;
  }

  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientIds,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    const err = new Error('Invalid Google token');
    err.status = 401;
    throw err;
  }
  if (payload.email_verified === false) {
    const err = new Error('Google email is not verified');
    err.status = 401;
    throw err;
  }
  return payload;
}

module.exports = {
  getGoogleClientIds,
  isGoogleAuthConfigured,
  verifyGoogleIdToken,
};
