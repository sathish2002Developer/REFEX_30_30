const router = require("express").Router();
const usersController = require("../controllers/users");
const validation = require("../middlewares/userValidator");
const Type = require("../utils/userTypes");
const authMiddleware = require("../middlewares/auth");

router
  .route("/users")
  .get(
    authMiddleware.authCheck,
    authMiddleware.authType(Type.SuperAdmin),
    usersController.getAllUsers
  )
  .post(
    authMiddleware.authCheck,
    authMiddleware.authType(Type.SuperAdmin),
    validation.createUserSchema,
    usersController.createUser
  );
router
  .route("/users/:id")
  .get(
    authMiddleware.authCheck,
    authMiddleware.authType(Type.SuperAdmin),
    usersController.getUserById
  )
  .put(
    authMiddleware.authCheck,
    authMiddleware.authType(Type.SuperAdmin),
    validation.createUserSchema,
    usersController.updateUserById
  )
  .delete(
    authMiddleware.authCheck,
    authMiddleware.authType(Type.SuperAdmin),
    usersController.deleteUserById
  );

module.exports = router;
