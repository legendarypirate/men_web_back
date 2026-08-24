const express = require('express');
const { CoachProgram, CoachSetting, PromoCode } = require('../models');
const { ok } = require('../utils/response');
const { normalizeCode } = require('../utils/promoCode');

const router = express.Router();

async function attachPromo(program) {
  if (!program) return null;
  const json = program.toJSON ? program.toJSON() : { ...program };
  if (!json.promoCode) return json;

  const promo = await PromoCode.findByPk(normalizeCode(json.promoCode));
  if (!promo || !promo.active) return json;

  return {
    ...json,
    promoLabel: promo.label,
    promoDiscountPercent: promo.discountPercent,
  };
}

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
      bannerSubtitle: 'Expert 1:1 support is now available inside VitalMen.',
      coachName: 'Dr. Sarah Chen',
      coachRole: 'Sexual Health Coach',
      coachImageUrl: null,
      learnMoreLabel: 'Learn More',
    };

    const enriched = await Promise.all(programs.map((p) => attachPromo(p)));
    const mainProgram = enriched.find((p) => p.section === 'main') || null;
    const recommended = enriched.filter((p) => p.section === 'recommended');
    const courses = enriched.filter((p) => p.section === 'courses');

    return ok(res, {
      screenTitle: banner.screenTitle,
      banner: {
        title: banner.bannerTitle,
        subtitle: banner.bannerSubtitle,
        coachName: banner.coachName,
        coachRole: banner.coachRole,
        coachImageUrl: banner.coachImageUrl,
        learnMoreLabel: banner.learnMoreLabel,
        promoCode: banner.promoCode || null,
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
