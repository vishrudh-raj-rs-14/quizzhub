const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.isLoggedIn);
router.get("/login", viewController.login);
router.get("/signup", viewController.signUp);
router.get("/", authController.redirect, viewController.home);
router.get("/profile", authController.redirect, viewController.profile);
router.get("/create", authController.redirect, viewController.create);
router.get("/quiz/:id/info", authController.redirect, viewController.quizInfo);
router.get("/quiz/:id/take", authController.redirect, viewController.quiz);
router.get(
  "/:id/profile",
  authController.redirect,
  viewController.otherProfile
);
router.get("/friends", authController.redirect, viewController.friends);

router.get("/api/oauth/google", authController.loginWithGoogle);
router.get("/api/oauth/delta", authController.loginWithDelta);

module.exports = router;
