const express = require("express");
const router = express.Router();
const { upload } = require("../middlewares/photoUpload");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  createPost,
  getAllPosts,
  getSinglePost,
  getPostsCount,
  deletePost,
  updatePost,
  updatePostImage,
  toggleLike,
} = require("../controller/postsController");
const { validateObjectId } = require("../middlewares/validateObjectId");

// /api/posts
router
  .route("/")
  .post(verifyToken, upload.single("image"), createPost)
  .get(getAllPosts);

// /api/posts/count
router.route("/count").get(getPostsCount);

// /api/posts/:id
router
  .route("/:id")
  .get(validateObjectId, getSinglePost)
  .put(validateObjectId, verifyToken, updatePost)
  .delete(validateObjectId, verifyToken, deletePost);

// /api/posts/upload-image/:id
router
  .route("/upload-image/:id")
  .put(validateObjectId, verifyToken, upload.single("image"), updatePostImage);

// /api/posts/like/:id
router.route("/like/:id").put(validateObjectId, verifyToken, toggleLike);

module.exports = router;
