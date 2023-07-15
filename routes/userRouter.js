const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const quizRouter = require("../routes/quizRouter");
const router = express.Router();

router.use("/:id/quiz", quizRouter);

router.post("/signUp", authController.signUp);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.patch(
  "/updateMe",
  authController.protect,
  userController.uploadSinglePhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

router.patch("/notify", authController.protect, userController.notify);

router.get("/", userController.getAllUsers);

module.exports = router;
