const express = require('express');
const { HomeProTip } = require('../models');
const { ok } = require('../utils/response');

const router = express.Router();

router.get('/pro-tips', async (req, res, next) => {
  try {
    const proTips = await HomeProTip.findAll({
      where: { active: true },
      order: [['sortOrder', 'ASC']],
      attributes: ['id', 'text', 'actionLabel', 'sortOrder'],
    });
    return ok(res, { proTips });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
