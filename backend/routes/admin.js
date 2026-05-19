const router = require("express").Router();
const usersController = require("../controllers/users");
const cmsHomeHeroController = require("../controllers/cmsHomeHero");
const cmsVisionPageController = require("../controllers/cmsVisionPage");
const cmsWallPageController = require("../controllers/cmsWallPage");
const cmsSiteChromeController = require("../controllers/cmsSiteChrome");
const wallAdminActivity = require("../controllers/wallAdminActivity");
const wallMembersController = require("../controllers/wallMembers");
const wallMemberRevisionsController = require("../controllers/wallMemberRevisions");
const cmsRevisionsController = require("../controllers/cmsRevisions");
const uploadWallMember = require("../middlewares/uploadWallMember");
const authMiddleware = require("../middlewares/auth");
const uploadCmsHero = require("../middlewares/uploadCmsHero");
const uploadVisionCms = require("../middlewares/uploadVisionCms");
const uploadSiteChromeCms = require("../middlewares/uploadSiteChromeCms");
const uploadWallCms = require("../middlewares/uploadWallCms");
const {
  createUserSchema,
  updateUserSchema,
} = require("../middlewares/userValidator");
const {
  createWallMemberSchema,
  updateWallMemberSchema,
} = require("../middlewares/wallMemberValidator");

// All admin routes require authentication
router.use(authMiddleware.requireAuth);

// CMS — Home hero (singleton)
router.patch(
  "/cms/home-hero",
  uploadCmsHero.single("backgroundImage"),
  cmsHomeHeroController.patchAdminHomeHero
);

router.patch(
  "/cms/vision",
  uploadVisionCms,
  cmsVisionPageController.patchAdminVisionPage
);

router.patch(
  "/cms/site-chrome",
  uploadSiteChromeCms,
  cmsSiteChromeController.patchAdminSiteChrome
);

router.patch(
  "/cms/wall",
  uploadWallCms,
  cmsWallPageController.patchAdminWallPage
);

router.get("/cms/:resource/revisions", cmsRevisionsController.listCmsRevisions);
router.get(
  "/cms/:resource/revisions/:revisionId/changes",
  cmsRevisionsController.getCmsRevisionChangesHandler
);
router.post(
  "/cms/:resource/revisions/:revisionId/revert",
  cmsRevisionsController.revertCmsRevision
);

router.get("/wall/activity", wallAdminActivity.listWallActivity);

router.get("/wall-members", wallMembersController.listWallMembers);
router.get(
  "/wall-members/:id/revisions",
  wallMemberRevisionsController.listWallMemberRevisions
);
router.get(
  "/wall-members/:id/revisions/:revisionId/changes",
  wallMemberRevisionsController.getWallMemberRevisionChangesHandler
);
router.post(
  "/wall-members/:id/revisions/:revisionId/revert",
  wallMemberRevisionsController.revertWallMemberRevision
);
router.get("/wall-members/:id", wallMembersController.getWallMemberById);
router.post(
  "/wall-members",
  uploadWallMember.single("avatar"),
  createWallMemberSchema,
  wallMembersController.createWallMember
);
router.patch(
  "/wall-members/:id",
  uploadWallMember.single("avatar"),
  updateWallMemberSchema,
  wallMembersController.updateWallMemberById
);

// User management routes
router.get("/users", usersController.getAllUsers);
router.get("/users/:id", usersController.getUserById);
router.post("/users", createUserSchema, usersController.createUser);
router.put("/users/:id", updateUserSchema, usersController.updateUserById);
router.delete("/users/:id", usersController.deleteUserById);

module.exports = router;


