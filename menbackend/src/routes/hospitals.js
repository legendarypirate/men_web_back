const express = require('express');
const { Hospital } = require('../models');
const { ok, fail } = require('../utils/response');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const hospitals = await Hospital.findAll({
      where: { active: true },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });
    return ok(res, { hospitals });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital || !hospital.active) {
      return fail(res, 'Эмнэлэг олдсонгүй', 404);
    }
    return ok(res, { hospital });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
