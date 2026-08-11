const { ok, fail } = require('../utils/response');
const { uploadImage, uploadVideo } = require('../services/mediaUpload');

async function handleImageUpload(req, res, next) {
  try {
    if (!req.file) return fail(res, 'Зураг файл олдсонгүй');
    const result = await uploadImage(req.file);
    return ok(res, result, 'Зураг амжилттай байршуулагдлаа', 201);
  } catch (err) {
    next(err);
  }
}

async function handleVideoUpload(req, res, next) {
  try {
    if (!req.file) return fail(res, 'Видео файл олдсонгүй');
    const result = await uploadVideo(req.file);
    return ok(res, result, 'Видео амжилттай байршуулагдлаа', 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { handleImageUpload, handleVideoUpload };
