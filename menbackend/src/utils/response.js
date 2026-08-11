function ok(res, data = null, message = 'OK', status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

function fail(res, message = 'Алдаа гарлаа', status = 400, errors = null) {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
}

function publicUser(user) {
  if (!user) return null;
  const json = user.toJSON ? user.toJSON() : user;
  delete json.passwordHash;
  return json;
}

function formatMnt(value) {
  return `${Number(value).toLocaleString('en-US')}₮`;
}

module.exports = { ok, fail, publicUser, formatMnt };
