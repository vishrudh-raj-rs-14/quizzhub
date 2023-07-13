const express = require("express");
const requestController = require("../controllers/requestController");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .get(requestController.getAllRequest)
  .post(authController.protect, requestController.sendFriendRequest)
  .patch(authController.protect, requestController.respondToRequest)
  .delete(authController.protect, requestController.removeRequest);

router
  .route("/delete")
  .post(authController.protect, requestController.removeRequest);

router
  .route("/unfriend")
  .post(authController.protect, requestController.unFriend);

module.exports = router;
