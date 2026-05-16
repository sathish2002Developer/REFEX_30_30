/**
 * JWT secret for user sessions (login). Must match between sign (auth) and verify (middleware).
 * In production, APP_KEY is required. Locally, a dev fallback is used if missing.
 */
require("dotenv").config();

const DEV_FALLBACK =
  "refex-local-dev-jwt-secret-change-me-and-set-APP_KEY-in-env";

let cached;

function getAppJwtSecret() {
  if (cached !== undefined) return cached;
  const fromEnv = process.env.APP_KEY?.trim();
  if (fromEnv) {
    cached = fromEnv;
    return cached;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "APP_KEY environment variable is required in production (used to sign JWTs)."
    );
  }
  console.warn(
    "[jwt] APP_KEY is not set — using a local development default. Set APP_KEY in backend/.env so tokens stay valid across restarts."
  );
  cached = DEV_FALLBACK;
  return cached;
}

module.exports = { getAppJwtSecret };
