const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyUserAccount,
} = require("../controller/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

// /api/auth/:userId/verify/:token
router.get("/:userId/verify/:token", verifyUserAccount);

module.exports = router;
