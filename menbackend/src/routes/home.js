const express = require('express');
const { HomeProTip, OnboardingStorySetting } = require('../models');
const { ok } = require('../utils/response');

const router = express.Router();

function mapOnboardingStory(settings) {
  if (!settings) return null;
  const slides = Array.isArray(settings.slides) ? settings.slides : [];
  return {
    active: settings.active,
    version: settings.version,
    headerTitle: settings.headerTitle,
    headerSubtitle: settings.headerSubtitle,
    finalButtonLabel: settings.finalButtonLabel,
    slides: slides
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
  };
}

router.get('/onboarding-story', async (req, res, next) => {
  try {
    let settings = await OnboardingStorySetting.findByPk('default');
    if (!settings) {
      settings = await OnboardingStorySetting.create({ id: 'default' });
    }
    const story = mapOnboardingStory(settings);
    if (!story?.active || !story.slides.length) {
      return ok(res, { story: null });
    }
    return ok(res, { story });
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
