const { fail } = require('../utils/response');

function notFound(req, res) {
  return fail(res, `Олдсонгүй: ${req.method} ${req.originalUrl}`, 404);
}

function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return fail(res, 'Файлын хэмжээ хэтэрсэн байна', 413);
  }
  if (err.name === 'MulterError') {
    return fail(res, err.message || 'Файл байршуулахад алдаа', 400);
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return fail(res, 'Өгөгдөл давхардсан байна', 409, err.errors);
  }
  if (err.name === 'SequelizeValidationError') {
    return fail(res, 'Баталгаажуулалтын алдаа', 422, err.errors);
  }
  return fail(res, err.message || 'Серверийн алдаа', err.status || 500);
}

module.exports = { notFound, errorHandler };
