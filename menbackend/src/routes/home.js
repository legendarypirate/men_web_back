const express = require('express');
const { HomeProTip, Article } = require('../models');
const { ok } = require('../utils/response');

const router = express.Router();

router.get('/onboarding-story', async (req, res, next) => {
  try {
    const article = await Article.findOne({
      where: { isOnboarding: true, published: true },
    });
    return ok(res, { article: article || null });
  } catch (err) {
    next(err);
  }
});

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
