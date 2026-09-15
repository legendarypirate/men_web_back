const express = require('express');
const { QuizStage, QuizQuestion, QuizConfig, QuizCompletion } = require('../models');
const { ok } = require('../utils/response');
const { normalizeEndMediaItems } = require('../utils/quizMedia');

const router = express.Router();

function mapStage(stage) {
  const json = stage.toJSON ? stage.toJSON() : stage;
  const endMediaItems = normalizeEndMediaItems(json);

  return {
    id: json.id,
    label: json.label,
    sortOrder: json.sortOrder,
    endMediaItems,
  };
}

function mapQuestion(question) {
  const json = question.toJSON ? question.toJSON() : question;
  return {
    id: json.id,
    stage: json.stageId,
    title: json.title,
    options: json.options || [],
  };
}

router.get('/', async (req, res, next) => {
  try {
    const [stages, questions, configRow] = await Promise.all([
      QuizStage.findAll({
        where: { active: true },
        order: [['sortOrder', 'ASC'], ['id', 'ASC']],
      }),
      QuizQuestion.findAll({
        where: { active: true },
        order: [['sortOrder', 'ASC'], ['id', 'ASC']],
      }),
      QuizConfig.findByPk('default'),
    ]);

    const config = configRow
      ? {
          processingTitle: configRow.processingTitle,
          processingMessages: configRow.processingMessages || [],
        }
      : {
          processingTitle: 'Таны төлөвлөгөө бэлтгэгдэж байна',
          processingMessages: [],
        };

    return ok(res, {
      stages: stages.map(mapStage),
      questions: questions.map(mapQuestion),
      config,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/complete', async (req, res, next) => {
  try {
    const raw = String(req.body?.source || 'web').trim().toLowerCase();
    const source = raw === 'app' ? 'app' : 'web';
    await QuizCompletion.create({ source });
    return ok(res, { recorded: true, source }, 'Quiz дууссан');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
