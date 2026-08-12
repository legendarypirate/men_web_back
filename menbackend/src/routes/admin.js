const express = require('express');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const {
  User,
  WorkoutProgram,
  WorkoutExercise,
  WorkoutSession,
  Article,
  HealthBite,
  PremiumPlan,
  Payment,
  Product,
  Order,
  OrderItem,
  AssessmentQuestion,
  AssessmentAnswer,
} = require('../models');
const { ok, fail, publicUser, formatMnt } = require('../utils/response');
const { adminRequired, signToken } = require('../middleware/auth');
const { uploadVideo, uploadImage } = require('../middleware/upload');
const { handleImageUpload, handleVideoUpload } = require('./upload');
const { getPaymentSettings, mapPaymentSettings } = require('../utils/paymentSettings');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return fail(res, 'И-мэйл болон нууц үг шаардлагатай');
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user || !user.passwordHash) {
      return fail(res, 'И-мэйл эсвэл нууц үг буруу', 401);
    }
    if (user.role !== 'admin') {
      return fail(res, 'Админ эрхгүй хэрэглэгч', 403);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return fail(res, 'И-мэйл эсвэл нууц үг буруу', 401);

    const token = signToken(user);
    return ok(res, { token, user: publicUser(user) }, 'Админ нэвтэрлээ');
  } catch (err) {
    next(err);
  }
});

router.get('/me', adminRequired, (req, res) => {
  return ok(res, { user: req.userJson });
});

router.get('/stats', adminRequired, async (req, res, next) => {
  try {
    const [
      users,
      sessions,
      articles,
      programs,
      payments,
      paidRevenue,
      pendingPayments,
      products,
      orders,
      pendingOrders,
      orderRevenue,
      assessmentQuestions,
    ] = await Promise.all([
      User.count(),
      WorkoutSession.count(),
      Article.count(),
      WorkoutProgram.count(),
      Payment.count(),
      Payment.sum('amountMnt', { where: { status: 'paid' } }),
      Payment.count({ where: { status: 'pending' } }),
      Product.count({ where: { active: true } }),
      Order.count(),
      Order.count({ where: { status: 'pending' } }),
      Order.sum('totalMnt', {
        where: { status: { [Op.in]: ['paid', 'processing', 'shipped', 'delivered'] } },
      }),
      AssessmentQuestion.count({ where: { active: true } }),
    ]);

    const premiumUsers = await User.count({
      where: { membership: { [Op.ne]: 'free' } },
    });

    return ok(res, {
      users,
      premiumUsers,
      sessions,
      articles,
      programs,
      payments,
      pendingPayments,
      paidRevenue: paidRevenue || 0,
      paidRevenueLabel: formatMnt(paidRevenue || 0),
      products,
      orders,
      pendingOrders,
      orderRevenue: orderRevenue || 0,
      orderRevenueLabel: formatMnt(orderRevenue || 0),
      assessmentQuestions,
    });
  } catch (err) {
    next(err);
  }
});

// --- Users ---
router.get('/users', adminRequired, async (req, res, next) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['passwordHash'] },
    });
    return ok(res, { users });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id', adminRequired, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return fail(res, 'Хэрэглэгч олдсонгүй', 404);

    const allowed = [
      'name',
      'membership',
      'vitalityScore',
      'streakDays',
      'role',
      'darkMode',
      'primaryGoal',
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    await user.update(updates);
    return ok(res, { user: publicUser(user) }, 'Хэрэглэгч шинэчлэгдлээ');
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', adminRequired, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return fail(res, 'Хэрэглэгч олдсонгүй', 404);
    if (user.role === 'admin') {
      return fail(res, 'Админ хэрэглэгчийг устгах боломжгүй');
    }
    await user.destroy();
    return ok(res, null, 'Хэрэглэгч устгагдлаа');
  } catch (err) {
    next(err);
  }
});

// --- Workout programs ---
router.post(
  '/upload/image',
  adminRequired,
  uploadImage.single('image'),
  handleImageUpload
);
router.post(
  '/upload/video',
  adminRequired,
  uploadVideo.single('video'),
  handleVideoUpload
);

router.get('/workouts', adminRequired, async (req, res, next) => {
  try {
    const programs = await WorkoutProgram.findAll({
      include: [{ model: WorkoutExercise, as: 'exercises' }],
      order: [
        ['sortOrder', 'ASC'],
        [{ model: WorkoutExercise, as: 'exercises' }, 'sortOrder', 'ASC'],
      ],
    });
    return ok(res, { programs });
  } catch (err) {
    next(err);
  }
});

router.post('/workouts', adminRequired, async (req, res, next) => {
  try {
    const { exercises = [], ...programData } = req.body;
    if (!programData.id || !programData.title) {
      return fail(res, 'id болон title шаардлагатай');
    }

    const program = await WorkoutProgram.create(programData);
    for (let i = 0; i < exercises.length; i++) {
      await WorkoutExercise.create({
        ...exercises[i],
        programId: program.id,
        sortOrder: exercises[i].sortOrder ?? i,
      });
    }

    const full = await WorkoutProgram.findByPk(program.id, {
      include: [{ model: WorkoutExercise, as: 'exercises' }],
    });
    return ok(res, { program: full }, 'Дасгал нэмэгдлээ', 201);
  } catch (err) {
    next(err);
  }
});

router.put('/workouts/:id', adminRequired, async (req, res, next) => {
  try {
    const program = await WorkoutProgram.findByPk(req.params.id);
    if (!program) return fail(res, 'Дасгал олдсонгүй', 404);

    const { exercises, ...programData } = req.body;
    await program.update(programData);

    if (Array.isArray(exercises)) {
      await WorkoutExercise.destroy({ where: { programId: program.id } });
      for (let i = 0; i < exercises.length; i++) {
        await WorkoutExercise.create({
          ...exercises[i],
          programId: program.id,
          sortOrder: exercises[i].sortOrder ?? i,
        });
      }
    }

    const full = await WorkoutProgram.findByPk(program.id, {
      include: [{ model: WorkoutExercise, as: 'exercises' }],
    });
    return ok(res, { program: full }, 'Дасгал шинэчлэгдлээ');
  } catch (err) {
    next(err);
  }
});

router.delete('/workouts/:id', adminRequired, async (req, res, next) => {
  try {
    const program = await WorkoutProgram.findByPk(req.params.id);
    if (!program) return fail(res, 'Дасгал олдсонгүй', 404);
    await program.destroy();
    return ok(res, null, 'Дасгал устгагдлаа');
  } catch (err) {
    next(err);
  }
});

// --- Articles ---
router.get('/articles', adminRequired, async (req, res, next) => {
  try {
    const articles = await Article.findAll({ order: [['createdAt', 'DESC']] });
    return ok(res, { articles });
  } catch (err) {
    next(err);
  }
});

router.post('/articles', adminRequired, async (req, res, next) => {
  try {
    const article = await Article.create(req.body);
    return ok(res, { article }, 'Нийтлэл нэмэгдлээ', 201);
  } catch (err) {
    next(err);
  }
});

router.put('/articles/:id', adminRequired, async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return fail(res, 'Нийтлэл олдсонгүй', 404);
    await article.update(req.body);
    return ok(res, { article }, 'Нийтлэл шинэчлэгдлээ');
  } catch (err) {
    next(err);
  }
});

router.delete('/articles/:id', adminRequired, async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return fail(res, 'Нийтлэл олдсонгүй', 404);
    await article.destroy();
    return ok(res, null, 'Нийтлэл устгагдлаа');
  } catch (err) {
    next(err);
  }
});

// --- Health bites ---
router.get('/health-bites', adminRequired, async (req, res, next) => {
  try {
    const healthBites = await HealthBite.findAll({ order: [['sortOrder', 'ASC']] });
    return ok(res, { healthBites });
  } catch (err) {
    next(err);
  }
});

router.post('/health-bites', adminRequired, async (req, res, next) => {
  try {
    const healthBite = await HealthBite.create(req.body);
    return ok(res, { healthBite }, 'Мэдээлэл нэмэгдлээ', 201);
  } catch (err) {
    next(err);
  }
});

router.put('/health-bites/:id', adminRequired, async (req, res, next) => {
  try {
    const healthBite = await HealthBite.findByPk(req.params.id);
    if (!healthBite) return fail(res, 'Мэдээлэл олдсонгүй', 404);
    await healthBite.update(req.body);
    return ok(res, { healthBite }, 'Мэдээлэл шинэчлэгдлээ');
  } catch (err) {
    next(err);
  }
});

router.delete('/health-bites/:id', adminRequired, async (req, res, next) => {
  try {
    const healthBite = await HealthBite.findByPk(req.params.id);
    if (!healthBite) return fail(res, 'Мэдээлэл олдсонгүй', 404);
    await healthBite.destroy();
    return ok(res, null, 'Мэдээлэл устгагдлаа');
  } catch (err) {
    next(err);
  }
});

// --- Premium plans ---
router.get('/plans', adminRequired, async (req, res, next) => {
  try {
    const plans = await PremiumPlan.findAll({ order: [['sortOrder', 'ASC']] });
    return ok(res, { plans });
  } catch (err) {
    next(err);
  }
});

router.post('/plans', adminRequired, async (req, res, next) => {
  try {
    const plan = await PremiumPlan.create(req.body);
    return ok(res, { plan }, 'Төлөвлөгөө нэмэгдлээ', 201);
  } catch (err) {
    next(err);
  }
});

router.put('/plans/:id', adminRequired, async (req, res, next) => {
  try {
    const plan = await PremiumPlan.findByPk(req.params.id);
    if (!plan) return fail(res, 'Төлөвлөгөө олдсонгүй', 404);
    await plan.update(req.body);
    return ok(res, { plan }, 'Төлөвлөгөө шинэчлэгдлээ');
  } catch (err) {
    next(err);
  }
});

router.delete('/plans/:id', adminRequired, async (req, res, next) => {
  try {
    const plan = await PremiumPlan.findByPk(req.params.id);
    if (!plan) return fail(res, 'Төлөвлөгөө олдсонгүй', 404);
    await plan.destroy();
    return ok(res, null, 'Төлөвлөгөө устгагдлаа');
  } catch (err) {
    next(err);
  }
});

// --- Payments ---
router.get('/payments', adminRequired, async (req, res, next) => {
  try {
    const payments = await Payment.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: PremiumPlan, as: 'plan' },
      ],
      order: [['createdAt', 'DESC']],
    });
    return ok(res, { payments });
  } catch (err) {
    next(err);
  }
});

router.patch('/payments/:id', adminRequired, async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return fail(res, 'Төлбөр олдсонгүй', 404);

    const { status } = req.body;
    if (!['pending', 'paid', 'expired', 'cancelled'].includes(status)) {
      return fail(res, 'Буруу төлөв');
    }

    const updates = { status };
    if (status === 'paid') updates.paidAt = new Date();
    await payment.update(updates);

    if (status === 'paid') {
      const user = await User.findByPk(payment.userId);
      if (user) {
        await user.update({ membership: payment.planId });
      }
    }

    return ok(res, { payment }, 'Төлбөр шинэчлэгдлээ');
  } catch (err) {
    next(err);
  }
});

// --- Products (shop) ---
router.get('/products', adminRequired, async (req, res, next) => {
  try {
    const products = await Product.findAll({
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });
    return ok(res, { products });
  } catch (err) {
    next(err);
  }
});

router.post('/products', adminRequired, async (req, res, next) => {
  try {
    if (!req.body.id || !req.body.name) {
      return fail(res, 'id болон name шаардлагатай');
    }
    const product = await Product.create(req.body);
    return ok(res, { product }, 'Бүтээгдэхүүн нэмэгдлээ', 201);
  } catch (err) {
    next(err);
  }
});

router.put('/products/:id', adminRequired, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return fail(res, 'Бүтээгдэхүүн олдсонгүй', 404);
    await product.update(req.body);
    return ok(res, { product }, 'Бүтээгдэхүүн шинэчлэгдлээ');
  } catch (err) {
    next(err);
  }
});

router.delete('/products/:id', adminRequired, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return fail(res, 'Бүтээгдэхүүн олдсонгүй', 404);
    await product.destroy();
    return ok(res, null, 'Бүтээгдэхүүн устгагдлаа');
  } catch (err) {
    next(err);
  }
});

// --- Orders ---
router.get('/orders', adminRequired, async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return ok(res, { orders });
  } catch (err) {
    next(err);
  }
});

router.patch('/orders/:id', adminRequired, async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return fail(res, 'Захиалга олдсонгүй', 404);

    const { status, notes } = req.body;
    const allowed = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    const updates = {};
    if (status !== undefined) {
      if (!allowed.includes(status)) return fail(res, 'Буруу төлөв');
      updates.status = status;
    }
    if (notes !== undefined) updates.notes = notes;
    await order.update(updates);

    const full = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });
    return ok(res, { order: full }, 'Захиалга шинэчлэгдлээ');
  } catch (err) {
    next(err);
  }
});

// --- Workout sessions ---
router.get('/sessions', adminRequired, async (req, res, next) => {
  try {
    const sessions = await WorkoutSession.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: WorkoutProgram, as: 'program', attributes: ['id', 'title'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 200,
    });
    return ok(res, { sessions });
  } catch (err) {
    next(err);
  }
});

// --- Assessment questions ---
router.get('/assessment-questions', adminRequired, async (req, res, next) => {
  try {
    const questions = await AssessmentQuestion.findAll({
      order: [['sortOrder', 'ASC'], ['step', 'ASC']],
    });
    return ok(res, { questions });
  } catch (err) {
    next(err);
  }
});

router.post('/assessment-questions', adminRequired, async (req, res, next) => {
  try {
    if (!req.body.id || !req.body.questionKey || !req.body.title) {
      return fail(res, 'id, questionKey, title шаардлагатай');
    }
    const question = await AssessmentQuestion.create(req.body);
    return ok(res, { question }, 'Асуулт нэмэгдлээ', 201);
  } catch (err) {
    next(err);
  }
});

router.put('/assessment-questions/:id', adminRequired, async (req, res, next) => {
  try {
    const question = await AssessmentQuestion.findByPk(req.params.id);
    if (!question) return fail(res, 'Асуулт олдсонгүй', 404);
    await question.update(req.body);
    return ok(res, { question }, 'Асуулт шинэчлэгдлээ');
  } catch (err) {
    next(err);
  }
});

router.delete('/assessment-questions/:id', adminRequired, async (req, res, next) => {
  try {
    const question = await AssessmentQuestion.findByPk(req.params.id);
    if (!question) return fail(res, 'Асуулт олдсонгүй', 404);
    await question.destroy();
    return ok(res, null, 'Асуулт устгагдлаа');
  } catch (err) {
    next(err);
  }
});

// --- Payment settings ---
router.get('/settings/payment', adminRequired, async (req, res, next) => {
  try {
    const settings = await getPaymentSettings();
    return ok(res, { settings: mapPaymentSettings(settings) });
  } catch (err) {
    next(err);
  }
});

router.patch('/settings/payment', adminRequired, async (req, res, next) => {
  try {
    const settings = await getPaymentSettings();
    const {
      qpayEnabled,
      bankName,
      bankAccountNumber,
      bankAccountName,
      transferNote,
    } = req.body;

    await settings.update({
      ...(typeof qpayEnabled === 'boolean' ? { qpayEnabled } : {}),
      ...(bankName != null ? { bankName: String(bankName).trim() } : {}),
      ...(bankAccountNumber != null
        ? { bankAccountNumber: String(bankAccountNumber).trim() }
        : {}),
      ...(bankAccountName != null
        ? { bankAccountName: String(bankAccountName).trim() }
        : {}),
      ...(transferNote != null ? { transferNote: String(transferNote).trim() } : {}),
    });

    return ok(res, { settings: mapPaymentSettings(settings) }, 'Тохиргоо хадгалагдлаа');
  } catch (err) {
    next(err);
  }
});

// --- User assessment answers ---
router.get('/assessment-answers', adminRequired, async (req, res, next) => {
  try {
    const answers = await AssessmentAnswer.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 300,
    });
    return ok(res, { answers });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
