const express = require("express");
const router = express.Router();
const { upload } = require("../middlewares/photoUpload");
const { validateObjectId } = require("../middlewares/validateObjectId");
const {
  getAllUsers,
  getUserById,
  updateUser,
  getUsersCount,
  profilePhotoUpdate,
  deleteUser,
} = require("../controller/usersController");
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
  verifyTokenAndAuthorization,
} = require("../middlewares/verifyToken");

// /api/users/profile
router.route("/profile").get(verifyTokenAndAdmin, getAllUsers);

// /api/users/profile/:id
router
  .route("/profile/:id")
  .get(validateObjectId, getUserById)
  .put(validateObjectId, verifyTokenAndOnlyUser, updateUser)
  .delete(validateObjectId, verifyTokenAndAuthorization, deleteUser);
// /api/users/profile/profile-photo-update
router
  .route("/profile/profile-photo-update/:id")
  .post(verifyToken, upload.single("image"), profilePhotoUpdate);

// /api/users/count
router.route("/count").get(verifyTokenAndAdmin, getUsersCount);

module.exports = router;
