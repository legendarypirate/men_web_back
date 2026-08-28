const { envPath, port } = require('./config/env');
const app = require('./app');
const { sequelize } = require('./models');
const { ensureWorkoutPrograms } = require('./bootstrap/ensureWorkoutPrograms');
const { ensureContent } = require('./bootstrap/ensureContent');
const { ensureQuiz } = require('./bootstrap/ensureQuiz');

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    await ensureWorkoutPrograms();
    await ensureContent();
    await ensureQuiz();
    const { ensureDemoUser } = require('./bootstrap/ensureAuth');
    await ensureDemoUser();
    console.log('Database connected');
    console.log(`Loaded env from: ${envPath}`);

    app.listen(port, '0.0.0.0', () => {
      console.log(`Tenkhee API listening on http://0.0.0.0:${port}`);
      console.log(`Health: http://localhost:${port}/health`);
      console.log(`API map: http://localhost:${port}/api`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
