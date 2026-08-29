const sequelize = require('../config/database');
const User = require('./User');
const WorkoutProgram = require('./WorkoutProgram');
const WorkoutExercise = require('./WorkoutExercise');
const WorkoutSession = require('./WorkoutSession');
const Article = require('./Article');
const ArticleCategory = require('./ArticleCategory');
const HealthBite = require('./HealthBite');
const PremiumPlan = require('./PremiumPlan');
const Payment = require('./Payment');
const AssessmentAnswer = require('./AssessmentAnswer');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const AssessmentQuestion = require('./AssessmentQuestion');
const PaymentSettings = require('./PaymentSettings');
const Hospital = require('./Hospital');
const HospitalCategory = require('./HospitalCategory');
const CoachSetting = require('./CoachSetting');
const CoachProgram = require('./CoachProgram');
const PromoCode = require('./PromoCode');
const HomeProTip = require('./HomeProTip');
const Feedback = require('./Feedback');
const QuizStage = require('./QuizStage');
const QuizQuestion = require('./QuizQuestion');
const QuizConfig = require('./QuizConfig');

WorkoutProgram.hasMany(WorkoutExercise, {
  foreignKey: 'programId',
  as: 'exercises',
  onDelete: 'CASCADE',
});
WorkoutExercise.belongsTo(WorkoutProgram, {
  foreignKey: 'programId',
  as: 'program',
});

User.hasMany(WorkoutSession, { foreignKey: 'userId', as: 'sessions' });
WorkoutSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });
WorkoutSession.belongsTo(WorkoutProgram, {
  foreignKey: 'programId',
  as: 'program',
});

User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Payment.belongsTo(PremiumPlan, { foreignKey: 'planId', as: 'plan' });

User.hasMany(AssessmentAnswer, { foreignKey: 'userId', as: 'assessments' });
AssessmentAnswer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(Feedback, { foreignKey: 'userId', as: 'feedback' });
Feedback.belongsTo(User, { foreignKey: 'userId', as: 'user' });

QuizStage.hasMany(QuizQuestion, {
  foreignKey: 'stageId',
  as: 'questions',
  onDelete: 'CASCADE',
});
QuizQuestion.belongsTo(QuizStage, { foreignKey: 'stageId', as: 'stage' });

module.exports = {
  sequelize,
  User,
  WorkoutProgram,
  WorkoutExercise,
  WorkoutSession,
  Article,
  ArticleCategory,
  HealthBite,
  PremiumPlan,
  Payment,
  AssessmentAnswer,
  Product,
  Order,
  OrderItem,
  AssessmentQuestion,
  PaymentSettings,
  Hospital,
  HospitalCategory,
  CoachSetting,
  CoachProgram,
  PromoCode,
  HomeProTip,
  Feedback,
  QuizStage,
  QuizQuestion,
  QuizConfig,
};
