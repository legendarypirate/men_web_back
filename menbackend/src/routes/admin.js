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
  HomeProTip,
  PremiumPlan,
  Payment,
  Product,
  Order,
  OrderItem,
  AssessmentQuestion,
  AssessmentAnswer,
  Hospital,
  HospitalCategory,
  CoachProgram,
  CoachSetting,
  PromoCode,
  Feedback,
} = require('../models');
const { ok, fail, publicUser, formatMnt } = require('../utils/response');
const { adminRequired, signToken } = require('../middleware/auth');
const { uploadVideo, uploadImage } = require('../middleware/upload');
const { handleImageUpload, handleVideoUpload } = require('./upload');
const { getPaymentSettings, mapPaymentSettings } = require('../utils/paymentSettings');
const {
  applyAdminMembershipUpdate,
  computeMembershipExpiry,
  mapPlanToMembership,
  enrichPublicUser,
  hasActivePremium,
} = require('../utils/membership');

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
      hospitals,
      coachPrograms,
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
      Hospital.count({ where: { active: true } }),
      CoachProgram.count({ where: { active: true } }),
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
      hospitals,
      coachPrograms,
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
    const mapped = users.map((user) => {
      const json = user.toJSON();
      json.hasActivePremium = hasActivePremium(user);
      return json;
    });
    return ok(res, { users: mapped });
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
      'vitalityScore',
      'streakDays',
      'role',
      'darkMode',
      'primaryGoal',
      'membershipStartedAt',
      'membershipExpiresAt',
    ];

    if (req.body.membership !== undefined) {
      applyAdminMembershipUpdate(user, req.body.membership, req.body);
    }

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (key === 'membershipStartedAt' || key === 'membershipExpiresAt') {
          user[key] = req.body[key] ? new Date(req.body[key]) : null;
        } else {
          user[key] = req.body[key];
        }
      }
    }

    await user.save();
    return ok(res, { user: await enrichPublicUser(user) }, 'Хэрэглэгч шинэчлэгдлээ');
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
    const articles = await Article.findAll({
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });
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

// --- Home pro tips (Нүүр зөвлөмж) ---
router.get('/home-pro-tips', adminRequired, async (req, res, next) => {
  try {
    const proTips = await HomeProTip.findAll({ order: [['sortOrder', 'ASC']] });
    return ok(res, { proTips });
  } catch (err) {
    next(err);
  }
});

router.post('/home-pro-tips', adminRequired, async (req, res, next) => {
  try {
    const proTip = await HomeProTip.create(req.body);
    return ok(res, { proTip }, 'Зөвлөмж нэмэгдлээ', 201);
  } catch (err) {
    next(err);
  }
});

router.put('/home-pro-tips/:id', adminRequired, async (req, res, next) => {
  try {
    const proTip = await HomeProTip.findByPk(req.params.id);
    if (!proTip) return fail(res, 'Зөвлөмж олдсонгүй', 404);
    await proTip.update(req.body);
    return ok(res, { proTip }, 'Зөвлөмж шинэчлэгдлээ');
  } catch (err) {
    next(err);
  }
});

router.delete('/home-pro-tips/:id', adminRequired, async (req, res, next) => {
  try {
    const proTip = await HomeProTip.findByPk(req.params.id);
    if (!proTip) return fail(res, 'Зөвлөмж олдсонгүй', 404);
    await proTip.destroy();
    return ok(res, null, 'Зөвлөмж устгагдлаа');
  } catch (err) {
    next(err);
  }
});

// --- User feedback ---
router.get('/feedback', adminRequired, async (req, res, next) => {
  try {
    const feedback = await Feedback.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return ok(res, { feedback });
  } catch (err) {
    next(err);
  }
});

router.put('/feedback/:id', adminRequired, async (req, res, next) => {
  try {
    const item = await Feedback.findByPk(req.params.id);
    if (!item) return fail(res, 'Санал хүсэлт олдсонгүй', 404);

    const { status, adminNotes } = req.body;
    const updates = {};
    if (status != null) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    await item.update(updates);
    const feedback = await Feedback.findByPk(item.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
    return ok(res, { feedback }, 'Санал хүсэлт шинэчлэгдлээ');
  } catch (err) {
    next(err);
  }
});

router.delete('/feedback/:id', adminRequired, async (req, res, next) => {
  try {
    const item = await Feedback.findByPk(req.params.id);
    if (!item) return fail(res, 'Санал хүсэлт олдсонгүй', 404);
    await item.destroy();
    return ok(res, null, 'Санал хүсэлт устгагдлаа');
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
    if (status === 'paid') {
      updates.paidAt = payment.paidAt || new Date();
      updates.verifiedByQpay = true;
    }
    await payment.update(updates);

    if (status === 'paid') {
      const user = await User.findByPk(payment.userId);
      if (user) {
        const startedAt = payment.paidAt || new Date();
        user.membership = mapPlanToMembership(payment.planId);
        user.membershipStartedAt = startedAt;
        user.membershipExpiresAt = computeMembershipExpiry(
          payment.planId,
          startedAt
        );
        await user.save();
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

// --- Hospital categories ---
router.get('/hospital-categories', adminRequired, async (req, res, next) => {
  try {
    const categories = await HospitalCategory.findAll({
      order: [['sortOrder', 'ASC'], ['title', 'ASC']],
    });
    return ok(res, { categories });
  } catch (err) {
    next(err);
  }
});

router.post('/hospital-categories', adminRequired, async (req, res, next) => {
  try {
    if (!req.body.id || !req.body.title) {
      return fail(res, 'id болон title шаардлагатай');
    }
    const category = await HospitalCategory.create(req.body);
    return ok(res, { category }, 'Төрөл нэмэгдлээ', 201);
  } catch (err) {
    next(err);
  }
});

router.put('/hospital-categories/:id', adminRequired, async (req, res, next) => {
  try {
    const category = await HospitalCategory.findByPk(req.params.id);
    if (!category) return fail(res, 'Төрөл олдсонгүй', 404);
    await category.update(req.body);
    return ok(res, { category }, 'Төрөл шинэчлэгдлээ');
  } catch (err) {
    next(err);
  }
});

router.delete('/hospital-categories/:id', adminRequired, async (req, res, next) => {
  try {
    const category = await HospitalCategory.findByPk(req.params.id);
    if (!category) return fail(res, 'Төрөл олдсонгүй', 404);
    await category.destroy();
    return ok(res, null, 'Төрөл устгагдлаа');
  } catch (err) {
    next(err);
  }
});

// --- Hospitals ---
router.get('/hospitals', adminRequired, async (req, res, next) => {
  try {
    const hospitals = await Hospital.findAll({
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });
    return ok(res, { hospitals });
  } catch (err) {
    next(err);
  }
});

router.post('/hospitals', adminRequired, async (req, res, next) => {
  try {
    if (!req.body.id || !req.body.name) {
      return fail(res, 'id болон name шаардлагатай');
    }
    const hospital = await Hospital.create(req.body);
    return ok(res, { hospital }, 'Эмнэлэг нэмэгдлээ', 201);
  } catch (err) {
    next(err);
  }
});

router.put('/hospitals/:id', adminRequired, async (req, res, next) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) return fail(res, 'Эмнэлэг олдсонгүй', 404);
    await hospital.update(req.body);
    return ok(res, { hospital }, 'Эмнэлэг шинэчлэгдлээ');
  } catch (err) {
    next(err);
  }
});

router.delete('/hospitals/:id', adminRequired, async (req, res, next) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) return fail(res, 'Эмнэлэг олдсонгүй', 404);
    await hospital.destroy();
    return ok(res, null, 'Эмнэлэг устгагдлаа');
  } catch (err) {
    next(err);
  }
});

// --- Coach settings ---
router.get('/coach/settings', adminRequired, async (req, res, next) => {
  try {
    let settings = await CoachSetting.findByPk('default');
    if (!settings) {
      settings = await CoachSetting.create({ id: 'default' });
    }
    return ok(res, { settings });
  } catch (err) {
    next(err);
  }
});

router.put('/coach/settings', adminRequired, async (req, res, next) => {
  try {
    let settings = await CoachSetting.findByPk('default');
    if (!settings) {
      settings = await CoachSetting.create({ id: 'default', ...req.body });
    } else {
      await settings.update(req.body);
    }
    return ok(res, { settings }, 'Коуч тохиргоо хадгалагдлаа');
  } catch (err) {
    next(err);
  }
});

// --- Coach programs ---
router.get('/coach/programs', adminRequired, async (req, res, next) => {
  try {
    const programs = await CoachProgram.findAll({
      order: [['section', 'ASC'], ['sortOrder', 'ASC']],
    });
    return ok(res, { programs });
  } catch (err) {
    next(err);
  }
});

router.post('/coach/programs', adminRequired, async (req, res, next) => {
  try {
    if (!req.body.id || !req.body.title || !req.body.section) {
      return fail(res, 'id, title, section шаардлагатай');
    }
    const program = await CoachProgram.create(req.body);
    return ok(res, { program }, 'Коуч хөтөлбөр нэмэгдлээ', 201);
  } catch (err) {
    next(err);
  }
});

router.put('/coach/programs/:id', adminRequired, async (req, res, next) => {
  try {
    const program = await CoachProgram.findByPk(req.params.id);
    if (!program) return fail(res, 'Хөтөлбөр олдсонгүй', 404);
    await program.update(req.body);
    return ok(res, { program }, 'Хөтөлбөр шинэчлэгдлээ');
  } catch (err) {
    next(err);
  }
});

router.delete('/coach/programs/:id', adminRequired, async (req, res, next) => {
  try {
    const program = await CoachProgram.findByPk(req.params.id);
    if (!program) return fail(res, 'Хөтөлбөр олдсонгүй', 404);
    await program.destroy();
    return ok(res, null, 'Хөтөлбөр устгагдлаа');
  } catch (err) {
    next(err);
  }
});

// --- Promo codes ---
router.get('/promo-codes', adminRequired, async (req, res, next) => {
  try {
    const promoCodes = await PromoCode.findAll({
      order: [['code', 'ASC']],
    });
    return ok(res, { promoCodes });
  } catch (err) {
    next(err);
  }
});

router.post('/promo-codes', adminRequired, async (req, res, next) => {
  try {
    const code = String(req.body.code || '')
      .trim()
      .toUpperCase();
    if (!code || !req.body.label) {
      return fail(res, 'code болон label шаардлагатай');
    }
    const promoCode = await PromoCode.create({ ...req.body, code });
    return ok(res, { promoCode }, 'Promo код нэмэгдлээ', 201);
  } catch (err) {
    next(err);
  }
});

router.put('/promo-codes/:code', adminRequired, async (req, res, next) => {
  try {
    const promoCode = await PromoCode.findByPk(req.params.code);
    if (!promoCode) return fail(res, 'Promo код олдсонгүй', 404);
    await promoCode.update(req.body);
    return ok(res, { promoCode }, 'Promo код шинэчлэгдлээ');
  } catch (err) {
    next(err);
  }
});

router.delete('/promo-codes/:code', adminRequired, async (req, res, next) => {
  try {
    const promoCode = await PromoCode.findByPk(req.params.code);
    if (!promoCode) return fail(res, 'Promo код олдсонгүй', 404);
    await promoCode.destroy();
    return ok(res, null, 'Promo код устгагдлаа');
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
