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
      await existing.update({
        excerpt: data.excerpt,
        body: data.body,
        storySlides: data.storySlides,
        readMinutes: data.readMinutes,
        tag: data.tag,
        published: data.published,
        isNew: data.isNew,
        sortOrder: data.sortOrder,
        featured: data.featured,
        imageUrl: data.imageUrl,
      });
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
