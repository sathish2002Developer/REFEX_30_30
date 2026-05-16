const router = require("express").Router();
const cmsHomeHeroController = require("../controllers/cmsHomeHero");
const cmsVisionPageController = require("../controllers/cmsVisionPage");
const cmsSiteChromeController = require("../controllers/cmsSiteChrome");
const cmsWallPageController = require("../controllers/cmsWallPage");

router.get("/home-hero", cmsHomeHeroController.getPublicHomeHero);
router.get("/vision", cmsVisionPageController.getPublicVisionPage);
router.get("/site-chrome", cmsSiteChromeController.getPublicSiteChrome);
router.get("/wall", cmsWallPageController.getPublicWallPage);

module.exports = router;
