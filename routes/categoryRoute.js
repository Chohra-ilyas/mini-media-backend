const router = require("express").Router();
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const { validateObjectId } = require("../middlewares/validateObjectId");
const {
  createCategory,
  getAllcategories,
  deleteCategory,
} = require("../controller/categoriesController");

// /api/categories
router
  .route("/")
  .post(verifyTokenAndAdmin, createCategory)
  .get(getAllcategories);

router
  .route("/:id")
  .delete(validateObjectId, verifyTokenAndAdmin, deleteCategory);
module.exports = router;
