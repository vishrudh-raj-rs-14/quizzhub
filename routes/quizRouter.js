const express = require("express");
const authController = require("../controllers/authController");
const quizController = require("../controllers/quizController");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(quizController.getAllQuiz)
  .post(
    authController.protect,
    quizController.uploadImageFiles,
    quizController.processImages,
    quizController.createQuiz
  );

router.post("/:id", authController.protect, quizController.evaluate);

module.exports = router;
