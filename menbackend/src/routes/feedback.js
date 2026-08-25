const express = require('express');
const { Feedback } = require('../models');
const { ok, fail } = require('../utils/response');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/', authRequired, async (req, res, next) => {
  try {
    const message = String(req.body.message || '').trim();
    if (!message) {
      return fail(res, 'Санал хүсэлтийн текст шаардлагатай');
    }
    if (message.length > 5000) {
      return fail(res, 'Санал хүсэлт хэт урт байна (5000 тэмдэгт хүртэл)');
    }

    const feedback = await Feedback.create({
      userId: req.user.id,
      message,
      status: 'new',
    });

    return ok(res, { feedback }, 'Санал хүсэлт илгээгдлээ', 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
