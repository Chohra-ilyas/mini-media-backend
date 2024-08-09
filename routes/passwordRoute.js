const express = require("express");
const router = express.Router();
const {
  sendRestPasswordlLink,
  getRestPasswordlLink,
  resetPasswordlLink,
} = require("../controller/passwordController");

// /api/password/reset-password-link
router.post("/reset-password-link", sendRestPasswordlLink);

router
  .route("/reset-password/:userId/:token")
  .get(getRestPasswordlLink)
  .post(resetPasswordlLink);

module.exports = router;
