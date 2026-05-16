const router = require("express").Router();
const authController = require("../controllers/auth");
const authMiddleware = require("../middlewares/auth");
const {
  createUserSchema,
  validateLogin,
} = require("../middlewares/userValidator");
const { SuperAdmin } = require("../utils/userTypes");

router.post("/login", validateLogin, authController.login);
router.post("/logout", authMiddleware.authCheck, authController.logout);
// router.post("/register",createUserSchema,authController.register);
// router.get("/verify_email/:token",authController.verifyMail);
router.post("/forgot_password", authController.forgotPassword);
router.patch("/reset_password/:token", authController.resetPassword);
router.post("/verify_token/:token", authController.verifyToken);
router.post(
  "/create_api_key/:id",
  authMiddleware.authCheck,
  authMiddleware.authType(SuperAdmin),
  authController.createAPIKeyForUser
);

module.exports = router;
