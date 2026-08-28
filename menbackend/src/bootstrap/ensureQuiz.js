const { QuizStage, QuizQuestion, QuizConfig } = require('../models');
const { QUIZ_STAGES, QUIZ_QUESTIONS, QUIZ_CONFIG } = require('../data/quizSeed');

async function ensureQuiz() {
  const stageCount = await QuizStage.count();
  if (stageCount === 0) {
    await QuizStage.bulkCreate(
      QUIZ_STAGES.map((stage) => ({
        ...stage,
        endMediaType: 'none',
        active: true,
      }))
    );
    console.log(`Seeded ${QUIZ_STAGES.length} quiz stages`);
  }

  const questionCount = await QuizQuestion.count();
  if (questionCount === 0) {
    await QuizQuestion.bulkCreate(
      QUIZ_QUESTIONS.map((question) => ({
        ...question,
        active: true,
      }))
    );
    console.log(`Seeded ${QUIZ_QUESTIONS.length} quiz questions`);
  }

  const config = await QuizConfig.findByPk('default');
  if (!config) {
    await QuizConfig.create(QUIZ_CONFIG);
    console.log('Seeded quiz config');
  }
}

module.exports = { ensureQuiz };
