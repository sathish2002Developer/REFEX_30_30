const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadsDir = path.join(__dirname, "../uploads/cms");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)
      ? ext
      : ".jpg";
    const prefix =
      file.fieldname === "leaderPortrait" ? "vision-leader-" : "vision-hero-";
    cb(null, `${prefix}${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 12 * 1024 * 1024 },
}).fields([
  { name: "heroBackground", maxCount: 1 },
  { name: "leaderPortrait", maxCount: 1 },
]);
