const {
  Hospital,
  CoachProgram,
  CoachSetting,
  Product,
  PromoCode,
  Article,
  ArticleCategory,
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
  faqArticles,
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

const DEFAULT_ARTICLE_CATEGORIES = [
  'Шилдэг сонголтууд',
  'FAQ',
  'Бэлгийн эрүүл мэнд',
  'Сэргээлт',
  'Хоол тэжээл',
  'Шинжлэх ухаан',
];

async function ensureArticleCategories() {
  const { randomUUID } = require('crypto');
  const count = await ArticleCategory.count();
  if (count === 0) {
    await ArticleCategory.bulkCreate(
      DEFAULT_ARTICLE_CATEGORIES.map((name, index) => ({
        id: randomUUID(),
        name,
        sortOrder: index,
      }))
    );
    console.log(`Seeded ${DEFAULT_ARTICLE_CATEGORIES.length} article categories`);
  }

  const articleRows = await Article.findAll({
    attributes: ['category'],
    group: ['category'],
    raw: true,
  });
  let synced = 0;
  for (const row of articleRows) {
    const name = String(row.category || '').trim();
    if (!name) continue;
    const [, created] = await ArticleCategory.findOrCreate({
      where: { name },
      defaults: { id: randomUUID(), sortOrder: 100 + synced },
    });
    if (created) synced += 1;
  }
  if (synced > 0) {
    console.log(`Synced ${synced} article categories from existing articles`);
  }
}

async function ensureFaqArticles() {
  const { randomUUID } = require('crypto');
  let created = 0;
  for (const article of faqArticles) {
    const existing = await Article.findByPk(article.id);
    if (existing) continue;
    await Article.create(article);
    created += 1;
  }
  if (created > 0) {
    console.log(`Seeded ${created} FAQ articles`);
  }

  const [, categoryCreated] = await ArticleCategory.findOrCreate({
    where: { name: 'FAQ' },
    defaults: { id: randomUUID(), sortOrder: 1 },
  });
  if (categoryCreated) {
    console.log('Seeded FAQ article category');
  }

  const onboardingCount = await Article.count({ where: { isOnboarding: true } });
  if (onboardingCount === 0) {
    const firstFaq = await Article.findOne({
      where: { category: 'FAQ' },
      order: [['sortOrder', 'ASC']],
    });
    if (firstFaq) {
      await firstFaq.update({ isOnboarding: true });
      console.log('Marked first FAQ as onboarding story');
    }
  }
}

async function ensureContent() {
  await ensureHospitalCategories();
  await ensureArticleCategories();
  await ensureHospitals();
  await ensurePromoCodes();
  await ensureCoachContent();
  await ensureProductDetailSections();
  await ensureArticles();
  await ensureFaqArticles();
  await ensureHomeProTips();
}

module.exports = { ensureContent };
