const { cloudinary, ensureCloudinaryConfig } = require('../config/cloudinary');

function uploadBuffer(buffer, options = {}) {
  ensureCloudinaryConfig();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    stream.end(buffer);
  });
}

function videoThumbnailUrl(publicId) {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    transformation: [{ width: 640, height: 360, crop: 'fill', gravity: 'auto' }],
  });
}

async function uploadImage(file, { folder = 'vitalmen/images' } = {}) {
  const result = await uploadBuffer(file.buffer, {
    folder,
    resource_type: 'image',
    overwrite: true,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

async function uploadVideo(file, { folder = 'vitalmen/videos' } = {}) {
  const result = await uploadBuffer(file.buffer, {
    folder,
    resource_type: 'video',
    overwrite: true,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    thumbnailUrl: videoThumbnailUrl(result.public_id),
    duration: result.duration,
    format: result.format,
    bytes: result.bytes,
  };
}

module.exports = { uploadImage, uploadVideo };
