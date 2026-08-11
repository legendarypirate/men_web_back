const express = require('express');
const { AssessmentQuestion } = require('../models');
const { ok, fail } = require('../utils/response');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/questions', authRequired, async (req, res, next) => {
  try {
    const questions = await AssessmentQuestion.findAll({
      where: { active: true },
      order: [['sortOrder', 'ASC'], ['step', 'ASC']],
    });
    return ok(res, { questions, totalSteps: questions[0]?.totalSteps || 9 });
  } catch (err) {
    next(err);
  }
});

router.get('/questions/:questionKey', authRequired, async (req, res, next) => {
  try {
    const question = await AssessmentQuestion.findOne({
      where: { questionKey: req.params.questionKey, active: true },
    });
    if (!question) return fail(res, 'Асуулт олдсонгүй', 404);
    return ok(res, {
      step: question.step,
      totalSteps: question.totalSteps,
      questionKey: question.questionKey,
      question: question.title,
      helpText: question.helpText,
      options: question.options,
    });
  } catch (err) {
    next(err);
  }
});

// Legacy endpoint — maps to urgency question from DB
router.get('/urgency', authRequired, async (req, res, next) => {
  try {
    const question = await AssessmentQuestion.findOne({
      where: { questionKey: 'urgency', active: true },
    });
    if (!question) {
      return fail(res, 'Асуулт тохируулаагүй байна', 404);
    }
    return ok(res, {
      step: question.step,
      totalSteps: question.totalSteps,
      question: question.title,
      helpText: question.helpText,
      options: question.options,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/answers', authRequired, async (req, res, next) => {
  try {
    const { AssessmentAnswer } = require('../models');
    const { step, questionKey, answerKey, answerLabel } = req.body;
    if (!questionKey || !answerKey) {
      return fail(res, 'Асуулт болон хариулт шаардлагатай');
    }

    let answer = await AssessmentAnswer.findOne({
      where: { userId: req.user.id, questionKey },
    });
    if (answer) {
      answer.step = Number(step || 1);
      answer.answerKey = answerKey;
      answer.answerLabel = answerLabel || null;
      await answer.save();
    } else {
      answer = await AssessmentAnswer.create({
        userId: req.user.id,
        step: Number(step || 1),
        questionKey,
        answerKey,
        answerLabel: answerLabel || null,
      });
    }

    return ok(res, { answer }, 'Хариулт хадгалагдлаа', 201);
  } catch (err) {
    next(err);
  }
});

router.get('/answers', authRequired, async (req, res, next) => {
  try {
    const { AssessmentAnswer } = require('../models');
    const answers = await AssessmentAnswer.findAll({
      where: { userId: req.user.id },
      order: [['step', 'ASC']],
    });
    return ok(res, { answers });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
