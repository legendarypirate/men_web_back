const bcrypt = require('bcryptjs');
const { User } = require('../models');

const DEMO_EMAIL = 'tet@gmail.com';
const DEMO_PASSWORD = 'user12';

async function ensureDemoUser() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const existing = await User.findOne({ where: { email: DEMO_EMAIL } });

  if (existing) {
    await existing.update({
      passwordHash,
      provider: 'email',
      name: existing.name || 'Demo User',
    });
    return;
  }

  await User.create({
    email: DEMO_EMAIL,
    passwordHash,
    name: 'Demo User',
    provider: 'email',
    membership: 'free',
    language: 'mn',
  });
  console.log(`Demo app user ready: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

module.exports = { ensureDemoUser, DEMO_EMAIL, DEMO_PASSWORD };
