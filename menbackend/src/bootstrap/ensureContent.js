const {
  Hospital,
  CoachProgram,
  CoachSetting,
  Product,
} = require('../models');
const {
  hospitals,
  coachSetting,
  coachPrograms,
  kegelDetailSections,
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

async function ensureContent() {
  await ensureHospitals();
  await ensureCoachContent();
  await ensureProductDetailSections();
}

module.exports = { ensureContent };
