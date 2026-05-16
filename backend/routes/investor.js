const router = require("express").Router();
const investorFilesController = require("../controllers/investorFiles");
const investorMenuController = require("../controllers/investorMenu");
const uploadInvestorFile = require("../middlewares/uploadInvestorFile");
const authMiddleware = require("../middlewares/auth");

// Public routes (for displaying files on investor relations page)
router.get("/menu", investorMenuController.getInvestorMenu);
router.put("/menu", investorMenuController.saveInvestorMenu);

router.get("/files", investorFilesController.getAllInvestorFiles);
router.get("/files/years", investorFilesController.getYears);
router.get("/files/year/:year", investorFilesController.getInvestorFilesByYear);

// Protected routes (require authentication for admin operations)
// router.use(authMiddleware.requireAuth);

// CRUD operations for investor files
router.post("/files", uploadInvestorFile.single('file'), investorFilesController.createInvestorFile);
router.put("/files/:id", investorFilesController.updateInvestorFile);
router.delete("/files/:id", investorFilesController.deleteInvestorFile);

module.exports = router;

