const multer = require('multer');

const memoryStorage = multer.memoryStorage();

const uploadVideo = multer({
  storage: memoryStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isVideo =
      file.mimetype.startsWith('video/') ||
      /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(file.originalname);
    if (!isVideo) {
      cb(new Error('Зөвхөн видео файл (mp4, webm, mov) зөвшөөрнө'));
      return;
    }
    cb(null, true);
  },
});

const uploadImage = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isImage =
      file.mimetype.startsWith('image/') ||
      /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(file.originalname);
    if (!isImage) {
      cb(new Error('Зөвхөн зураг файл (jpg, png, webp, gif) зөвшөөрнө'));
      return;
    }
    cb(null, true);
  },
});

module.exports = { uploadVideo, uploadImage };
