const express = require("express");
const wallController = require("../controllers/wall");
const wallAuthController = require("../controllers/wallAuth");
const uploadWall = require("../middlewares/uploadWall");
const { wallRequireAuth, wallOptionalAuth } = require("../middlewares/wallAuth");

const router = express.Router();

// Auth (email + password; first sign-in sets password when DB field is empty)
router.post("/auth/check-email", wallAuthController.checkEmail);
router.post("/auth/login", wallAuthController.login);
router.post("/auth/forgot-password", wallAuthController.forgotPassword);
router.patch("/auth/reset-password", wallAuthController.resetPassword);
router.get("/auth/me", wallOptionalAuth, wallAuthController.me);

// Public read (optional auth for likedByMe)
router.get("/stats", wallController.getStats);
router.get("/posts", wallOptionalAuth, wallController.listPosts);
router.get("/posts/:id", wallOptionalAuth, wallController.getPost);
router.get("/posts/:id/likes", wallController.listLikers);
router.get("/posts/:id/comments", wallController.listComments);

// Protected write (login required)
router.post(
  "/posts",
  wallRequireAuth,
  uploadWall.fields([
    { name: "image", maxCount: 1 },
    { name: "sketch", maxCount: 1 },
  ]),
  wallController.createPost
);
router.patch("/posts/:id", wallRequireAuth, wallController.updatePost);
router.delete("/posts/:id", wallRequireAuth, wallController.deletePost);

router.patch("/posts/:id/like", wallRequireAuth, wallController.likePost);
router.patch("/posts/:id/bookmark", wallRequireAuth, wallController.bookmarkPost);
router.patch("/posts/:id/share", wallRequireAuth, wallController.sharePost);
router.patch("/posts/:id/save", wallRequireAuth, wallController.savePost);
router.post("/posts/:id/poll-vote", wallRequireAuth, wallController.votePoll);
router.post("/posts/:id/reactions", wallRequireAuth, wallController.addReaction);

router.post("/posts/:id/comments", wallRequireAuth, wallController.addComment);
router.delete(
  "/posts/:postId/comments/:commentId",
  wallRequireAuth,
  wallController.deleteComment
);

module.exports = router;
