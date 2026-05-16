const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { User } = require("../models");

const saltRounds = 10;

/**
 * Ensures the CMS admin user from data/cmsAdminSample.json exists (idempotent).
 */
async function ensureCmsAdminFromSample() {
  const samplePath = path.join(__dirname, "../data/cmsAdminSample.json");
  if (!fs.existsSync(samplePath)) {
    console.warn("cmsAdminSample.json not found; skipping CMS admin seed.");
    return;
  }

  const raw = JSON.parse(fs.readFileSync(samplePath, "utf8"));
  const {
    email,
    password,
    first_name = "CMS",
    last_name = "Admin",
    mobile_number = "0000000000",
  } = raw;

  if (!email || !password) {
    console.warn("cmsAdminSample.json missing email/password; skipping CMS admin seed.");
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const hashed = bcrypt.hashSync(String(password), saltRounds);

  const [user, created] = await User.findOrCreate({
    where: { email: normalizedEmail },
    defaults: {
      first_name,
      last_name,
      mobile_number,
      password: hashed,
      user_type: "Admin",
      is_active: true,
    },
  });

  if (!created) {
    await user.update({
      first_name,
      last_name,
      mobile_number,
      password: hashed,
      user_type: "Admin",
      is_active: true,
    });
  }

  console.log(
    created ? "CMS admin user created:" : "CMS admin user synced (password updated):",
    normalizedEmail
  );
}

module.exports = { ensureCmsAdminFromSample };
