const router = require("express").Router();
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");
const { validateObjectId } = require("../middlewares/validateObjectId");
const {
  createComment,
  getAllComments,
  deleteComment,
  updateComment,
} = require("../controller/commentController");

// /api/comment
router
  .route("/")
  .post(verifyToken, createComment)
  .get(verifyTokenAndAdmin, getAllComments);
router.route("/:id").put(validateObjectId,verifyToken,updateComment).delete(validateObjectId, verifyToken, deleteComment);

module.exports = router;
