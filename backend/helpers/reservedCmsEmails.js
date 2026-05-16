const fs = require("fs");
const path = require("path");
const { normalizeEmail } = require("./wallMember");

function reservedCmsOperatorEmails() {
  const out = new Set();
  try {
    const samplePath = path.join(__dirname, "../data/cmsAdminSample.json");
    if (fs.existsSync(samplePath)) {
      const { email } = JSON.parse(fs.readFileSync(samplePath, "utf8"));
      const n = normalizeEmail(email);
      if (n) out.add(n);
    }
  } catch {
    /* ignore */
  }
  return out;
}

function isReservedCmsEmail(email) {
  return reservedCmsOperatorEmails().has(normalizeEmail(email));
}

module.exports = {
  reservedCmsOperatorEmails,
  isReservedCmsEmail,
};
