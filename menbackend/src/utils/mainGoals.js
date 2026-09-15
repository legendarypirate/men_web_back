const { MainGoalConfig, MainGoalOption } = require('../models');

async function getPublicMainGoals() {
  let config = await MainGoalConfig.findByPk('default');
  if (!config) {
    const { MAIN_GOAL_CONFIG } = require('../data/mainGoalsSeed');
    config = await MainGoalConfig.create(MAIN_GOAL_CONFIG);
  }

  const options = await MainGoalOption.findAll({
    where: { active: true },
    order: [['sortOrder', 'ASC'], ['key', 'ASC']],
    attributes: ['key', 'title', 'description', 'sortOrder'],
  });

  return {
    screenTitle: config.screenTitle,
    defaultKey: config.defaultKey,
    options: options.map((row) => ({
      key: row.key,
      title: row.title,
      description: row.description,
      sortOrder: row.sortOrder,
    })),
  };
}

async function getActiveMainGoalKeys() {
  const options = await MainGoalOption.findAll({
    where: { active: true },
    attributes: ['key'],
  });
  return options.map((row) => row.key);
}

module.exports = { getPublicMainGoals, getActiveMainGoalKeys };
