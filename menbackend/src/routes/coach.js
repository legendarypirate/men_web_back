const express = require('express');
const { CoachProgram, CoachSetting } = require('../models');
const { ok } = require('../utils/response');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [settings, programs] = await Promise.all([
      CoachSetting.findByPk('default'),
      CoachProgram.findAll({
        where: { active: true },
        order: [['section', 'ASC'], ['sortOrder', 'ASC']],
      }),
    ]);

    const banner = settings || {
      screenTitle: 'Explore',
      bannerTitle: 'Private Coaching Is Now Available',
      bannerSubtitle: 'Expert 1:1 support is now available inside Tenkhee.',
      coachName: 'Dr. Sarah Chen',
      coachRole: 'Sexual Health Coach',
      coachImageUrl: null,
      learnMoreLabel: 'Learn More',
    };

    const list = programs.map((p) => (p.toJSON ? p.toJSON() : p));
    const mainProgram = list.find((p) => p.section === 'main') || null;
    const recommended = list.filter((p) => p.section === 'recommended');
    const courses = list.filter((p) => p.section === 'courses');

    return ok(res, {
      screenTitle: banner.screenTitle,
      banner: {
        title: banner.bannerTitle,
        subtitle: banner.bannerSubtitle,
        coachName: banner.coachName,
        coachRole: banner.coachRole,
        coachImageUrl: banner.coachImageUrl,
        learnMoreLabel: banner.learnMoreLabel,
      },
      mainProgram,
      recommended,
      courses,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
