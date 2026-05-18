const bcrypt = require("bcrypt");

const saltRounds = 10;

function hasWallPasswordStored(passwordHash) {
  return passwordHash != null && String(passwordHash).trim() !== "";
}

function hashWallPassword(plain) {
  return bcrypt.hashSync(String(plain), saltRounds);
}

async function verifyWallPassword(plain, hash) {
  if (!hasWallPasswordStored(hash)) return false;
  return bcrypt.compare(String(plain), hash);
}

function validateNewPassword(password) {
  const p = String(password || "");
  if (p.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[A-Za-z]/.test(p)) {
    return "Password must include at least one letter";
  }
  if (!/[0-9]/.test(p)) {
    return "Password must include at least one number";
  }
  return null;
}

function assertPasswordConfirmation(password, confirmPassword) {
  const confirm = confirmPassword ?? "";
  if (!confirm) {
    return "Please confirm your password";
  }
  if (String(password) !== String(confirm)) {
    return "Passwords do not match";
  }
  return null;
}

module.exports = {
  hasWallPasswordStored,
  hashWallPassword,
  verifyWallPassword,
  validateNewPassword,
  assertPasswordConfirmation,
};
