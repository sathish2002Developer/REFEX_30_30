const multer = require("multer");
const path = require("path");
const status = require("../helpers/response");
const fs = require("fs");
const util = require("util");
const writeFile = util.promisify(fs.writeFile);

const memoryStorage = multer.memoryStorage();

// Set up the multer upload with memory storage
const upload = multer({
  storage: memoryStorage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".pdf",
      ".docx",
    ];
    const ext = path.extname(file.originalname);
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("Only images or documents are allowed"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
}).single("document"); // Accept only one file with the field name 'document'

// Helper function to save a file from memory to disk
const saveFile = async (file, folder) => {
  // Create the folder if it doesn't exist
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  // Define the full path for the file
  const filePath = path.join(
    folder,
    file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
  );
  // Write the file to disk
  await writeFile(filePath, file.buffer);
  return file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
};

const uploadDocument = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      if (err.code === "LIMIT_FILE_SIZE") {
        return status.responseStatus(
          res,
          400,
          "File size exceeds the limit of 10 MB."
        );
      }
      return status.responseStatus(res, 400, err.message);
    } else if (err) {
      // An unknown error occurred when uploading.
      return status.responseStatus(
        res,
        400,
        `Failed to upload the document! ${err.message}.`
      );
    }

    if (!req.file) {
      return status.responseStatus(res, 400, "Please upload a document.");
    }

    // Save the document to disk
    try {
      const filename = await saveFile(req.file, "uploads/support_documents/");
      req.uploadedFile = { ...req.file, filename };
      next();
    } catch (saveError) {
      return status.responseStatus(
        res,
        500,
        `Error saving the document: ${saveError.message}`
      );
    }
  });
};

module.exports = uploadDocument;
