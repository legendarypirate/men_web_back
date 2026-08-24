const {
  Hospital,
  CoachProgram,
  CoachSetting,
  Product,
  PromoCode,
  Article,
} = require('../models');
const {
  hospitals,
  coachSetting,
  coachPrograms,
  kegelDetailSections,
  promoCodes,
  articles,
} = require('../data/seedContent');

async function ensureHospitals() {
  const count = await Hospital.count();
  if (count > 0) return;
  await Hospital.bulkCreate(hospitals);
  console.log(`Seeded ${hospitals.length} hospitals`);
}

async function ensureCoachContent() {
  const settings = await CoachSetting.findByPk('default');
  if (!settings) {
    await CoachSetting.create(coachSetting);
    console.log('Seeded coach settings');
  }

  const programCount = await CoachProgram.count();
  if (programCount === 0) {
    await CoachProgram.bulkCreate(coachPrograms);
    console.log(`Seeded ${coachPrograms.length} coach programs`);
  }
}

async function ensureProductDetailSections() {
  const product = await Product.findByPk('kegel-trainer');
  if (!product) return;

  const sections = product.detailSections || [];
  if (Array.isArray(sections) && sections.length > 0) return;

  await product.update({ detailSections: kegelDetailSections });
  console.log('Seeded kegel-trainer detail sections');
}

async function ensurePromoCodes() {
  const count = await PromoCode.count();
  if (count > 0) return;
  await PromoCode.bulkCreate(promoCodes);
  console.log(`Seeded ${promoCodes.length} promo codes`);
}

async function ensureArticles() {
  const count = await Article.count();
  if (count > 0) return;
  await Article.bulkCreate(articles);
  console.log(`Seeded ${articles.length} articles`);
}

async function ensureContent() {
  await ensureHospitals();
  await ensurePromoCodes();
  await ensureCoachContent();
  await ensureProductDetailSections();
  await ensureArticles();
}

module.exports = { ensureContent };
