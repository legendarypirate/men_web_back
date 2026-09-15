const { AppVersionSettings } = require('../models');
const { DEFAULTS } = require('../utils/appVersion');

async function ensureAppVersionSettings() {
  const existing = await AppVersionSettings.findByPk('default');
  if (!existing) {
    await AppVersionSettings.create(DEFAULTS);
    console.log('Seeded app version settings');
  }
}

module.exports = { ensureAppVersionSettings };
