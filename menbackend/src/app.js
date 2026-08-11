require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const workoutRoutes = require('./routes/workouts');
const progressRoutes = require('./routes/progress');
const learnRoutes = require('./routes/learn');
const paymentRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');
const assessmentRoutes = require('./routes/assessment');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'VitalMen API is running',
    time: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    name: 'VitalMen API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      workouts: '/api/workouts',
      progress: '/api/progress',
      learn: '/api/learn',
      payments: '/api/payments',
      dashboard: '/api/dashboard',
      assessment: '/api/assessment',
      shop: '/api/shop',
      admin: '/api/admin',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/learn', learnRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
