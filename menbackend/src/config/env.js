const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "../../.env");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

function required(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Create ${envPath} on the server (see .env.example).`,
    );
  }
  return String(value).trim();
}

const jwtSecret = required("JWT_SECRET");

function megabytesFromEnv(name, defaultMb) {
  const raw = process.env[name];
  if (raw == null || String(raw).trim() === "") {
    return defaultMb * 1024 * 1024;
  }
  const mb = Number(raw);
  if (!Number.isFinite(mb) || mb <= 0) {
    return defaultMb * 1024 * 1024;
  }
  return Math.floor(mb * 1024 * 1024);
}

const uploadVideoMaxBytes = megabytesFromEnv("UPLOAD_VIDEO_MAX_MB", 512);
const uploadImageMaxBytes = megabytesFromEnv("UPLOAD_IMAGE_MAX_MB", 20);

module.exports = {
  envPath,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || "development",
  uploadVideoMaxBytes,
  uploadImageMaxBytes,
  uploadVideoMaxMb: Math.round(uploadVideoMaxBytes / (1024 * 1024)),
  uploadImageMaxMb: Math.round(uploadImageMaxBytes / (1024 * 1024)),
};
