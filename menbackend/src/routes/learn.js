const express = require('express');
const { Op } = require('sequelize');
const { Article, HealthBite } = require('../models');
const { ok, fail } = require('../utils/response');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/articles', optionalAuth, async (req, res, next) => {
  try {
    const { category, q } = req.query;
    const where = {};
    if (category && category !== 'all' && category !== 'Бүх нийтлэл') {
      where.category = category;
    }
    if (q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { excerpt: { [Op.like]: `%${q}%` } },
      ];
    }

    const articles = await Article.findAll({
      where,
      order: [
        ['featured', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    const featured = articles.find((a) => a.featured) || articles[0] || null;

    return ok(res, {
      categories: ['Бүх нийтлэл', 'Сэргээлт', 'Хоол тэжээл', 'Шинжлэх ухаан'],
      featured,
      articles,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/articles/:id', optionalAuth, async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return fail(res, 'Нийтлэл олдсонгүй', 404);
    return ok(res, { article });
  } catch (err) {
    next(err);
  }
});

router.get('/bites', optionalAuth, async (req, res, next) => {
  try {
    const bites = await HealthBite.findAll({ order: [['sortOrder', 'ASC']] });
    return ok(res, { bites });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
