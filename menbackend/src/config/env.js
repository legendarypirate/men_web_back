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

module.exports = {
  envPath,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || "development",
};
