const {
  Hospital,
  CoachProgram,
  CoachSetting,
  Product,
  PromoCode,
  Article,
  HomeProTip,
  HospitalCategory,
} = require('../models');
const {
  hospitals,
  hospitalCategories,
  coachSetting,
  coachPrograms,
  kegelDetailSections,
  promoCodes,
  articles,
  homeProTips,
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

async function ensureSexualHealthStoryArticles() {
  const { sexualHealthStoryArticles } = require('../data/sexualHealthStoryArticles');

  for (const data of sexualHealthStoryArticles) {
    const existing = await Article.findOne({
      where: { title: data.title, category: data.category },
    });
    if (existing) {
      const updates = {};
      if (!existing.imageUrl && data.imageUrl) updates.imageUrl = data.imageUrl;
      if (!existing.body && data.body) updates.body = data.body;
      if (!existing.excerpt && data.excerpt) updates.excerpt = data.excerpt;
      const slides = existing.storySlides;
      const hasSlides = Array.isArray(slides) && slides.length > 0;
      if (!hasSlides && data.storySlides?.length) {
        updates.storySlides = data.storySlides;
      }
      if (Object.keys(updates).length > 0) {
        await existing.update(updates);
      }
    } else {
      await Article.create(data);
    }
  }
  console.log(`Ensured ${sexualHealthStoryArticles.length} Бэлгийн эрүүл мэнд story articles`);
}

async function ensureHomeProTips() {
  const count = await HomeProTip.count();
  if (count > 0) return;
  await HomeProTip.bulkCreate(homeProTips);
  console.log(`Seeded ${homeProTips.length} home pro tips`);
}

async function ensureHospitalCategories() {
  const count = await HospitalCategory.count();
  if (count > 0) return;
  await HospitalCategory.bulkCreate(hospitalCategories);
  console.log(`Seeded ${hospitalCategories.length} hospital categories`);
}

async function ensureContent() {
  await ensureHospitalCategories();
  await ensureHospitals();
  await ensurePromoCodes();
  await ensureCoachContent();
  await ensureProductDetailSections();
  await ensureArticles();
  await ensureSexualHealthStoryArticles();
  await ensureHomeProTips();
}

module.exports = { ensureContent };
