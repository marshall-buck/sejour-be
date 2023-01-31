/** Shared config for application; can be required many places. */

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const PORT = process.env.PORT ? +process.env.PORT : 3001;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? "sejour_test"
    : process.env.DATABASE_URL || "sejour";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested

// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

// AWS config
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_BUCKET = process.env.AWS_BUCKET;
const AWS_BUCKET_PUBLIC_FOLDER = process.env.AWS_BUCKET_PUBLIC_FOLDER;

// GCP config
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY as string;

// File upload config
const MAX_SIZE_LIMIT = process.env.NODE_ENV === "test" ? 1000 : 10485760; // 1024 * 1024 * 10 or 10mb

// Default avatar
const AVATAR_ICON =
  "https://img.icons8.com/fluency-systems-filled/96/null/guest-male.png";

export {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
  AWS_SECRET_ACCESS_KEY,
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_BUCKET,
  AWS_BUCKET_PUBLIC_FOLDER,
  MAX_SIZE_LIMIT,
  AVATAR_ICON,
  GOOGLE_MAPS_API_KEY
};
