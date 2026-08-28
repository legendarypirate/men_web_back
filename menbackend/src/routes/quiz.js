const express = require('express');
const { QuizStage, QuizQuestion, QuizConfig } = require('../models');
const { ok } = require('../utils/response');

const router = express.Router();

function mapStage(stage) {
  const json = stage.toJSON ? stage.toJSON() : stage;
  const endMedia =
    json.endMediaType && json.endMediaType !== 'none' && json.endMediaUrl
      ? {
          type: json.endMediaType,
          url: json.endMediaUrl,
          caption: json.endMediaCaption || '',
        }
      : null;

  return {
    id: json.id,
    label: json.label,
    sortOrder: json.sortOrder,
    endMedia,
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

module.exports = router;
