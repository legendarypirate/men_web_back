const { MainGoalConfig, MainGoalOption } = require('../models');
const { MAIN_GOAL_CONFIG, MAIN_GOAL_OPTIONS } = require('../data/mainGoalsSeed');

async function ensureMainGoals() {
  const config = await MainGoalConfig.findByPk('default');
  if (!config) {
    await MainGoalConfig.create(MAIN_GOAL_CONFIG);
    console.log('Seeded main goal config');
  }

  const optionCount = await MainGoalOption.count();
  if (optionCount === 0) {
    await MainGoalOption.bulkCreate(MAIN_GOAL_OPTIONS);
    console.log(`Seeded ${MAIN_GOAL_OPTIONS.length} main goal options`);
  }
}

module.exports = { ensureMainGoals };
