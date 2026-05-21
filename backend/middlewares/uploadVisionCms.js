const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadsDir = path.join(__dirname, "../uploads/cms");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const VIDEO_EXTS = [".mp4", ".webm", ".mov", ".m4v"];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isVideo = file.mimetype.startsWith("video/");
    const allowed = isVideo ? VIDEO_EXTS : IMAGE_EXTS;
    const safeExt = allowed.includes(ext) ? ext : isVideo ? ".mp4" : ".jpg";
    let prefix = "vision-hero-";
    if (file.fieldname === "leaderPortrait") prefix = "vision-leader-";
    else if (file.fieldname === "heroVideo") prefix = "vision-hero-video-";
    cb(null, `${prefix}${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image or video files are allowed"), false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 80 * 1024 * 1024 },
}).fields([
  { name: "heroBackground", maxCount: 1 },
  { name: "heroVideo", maxCount: 1 },
  { name: "leaderPortrait", maxCount: 1 },
]);
