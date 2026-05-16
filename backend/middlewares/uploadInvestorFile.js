const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure investor uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/investor');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for investor file uploads (PDF, DOC, DOCX, XLS, XLSX)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `investor-${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow PDF, DOC, DOCX, XLS, XLSX files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /\.(pdf|doc|docx|xls|xlsx)$/i;
  const extname = allowedTypes.test(path.extname(file.originalname));
  const mimetype = allowedTypes.test(file.mimetype) || 
                   file.mimetype === 'application/pdf' ||
                   file.mimetype === 'application/msword' ||
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   file.mimetype === 'application/vnd.ms-excel' ||
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, XLS, and XLSX files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;

