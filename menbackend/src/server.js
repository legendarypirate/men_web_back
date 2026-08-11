require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = Number(process.env.PORT || 3001);

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Database connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`VitalMen API listening on http://0.0.0.0:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log(`API map: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
