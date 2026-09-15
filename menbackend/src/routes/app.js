const express = require('express');
const { ok, fail } = require('../utils/response');
const {
  getAppVersionSettings,
  evaluateVersionCheck,
} = require('../utils/appVersion');

const router = express.Router();

router.get('/version-check', async (req, res, next) => {
  try {
    const platform = String(req.query.platform || '').trim().toLowerCase();
    const version = String(req.query.version || '').trim();

    if (!platform || !version) {
      return fail(res, 'platform болон version шаардлагатай');
    }
    if (platform !== 'ios' && platform !== 'android') {
      return fail(res, 'platform нь ios эсвэл android байх ёстой');
    }

    const settings = await getAppVersionSettings();
    const result = evaluateVersionCheck(platform, version, settings);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
