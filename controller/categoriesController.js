const asyncHandler = require("express-async-handler");
const { validateCreateCategory, Category } = require("../model/Category");

/**
 * @desc Create new category
 * @route /api/categories
 * @method POST
 * @access private (only Admin)
 */
module.exports.createCategory = asyncHandler(async (req, res) => {
  //1.validate data
  const { error } = validateCreateCategory(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  //2.create category
  const category = await Category.create({
    title: req.body.title.toLowerCase(),
    user: req.user.id,
  });

  //4.send response to client
  res.status(201).json(category);
});

/**
 * @desc Get all categories
 * @route /api/categories
 * @method GET
 * @access public
 */
module.exports.getAllcategories = asyncHandler(async (req, res) => {
  //1.get all categories
  const category = await Category.find();

  //2.send response to client
  res.status(200).json(category);
});

/**
 * @desc Delete category
 * @route /api/categories/:id
 * @method DELETE
 * @access private (only admin)
 */
module.exports.deleteCategory = asyncHandler(async (req, res) => {
  //1.get all categories
  const category = await Category.findById(req.params.id);

  if(!category){
    return res.status(404).json({ message: "category not found" });
  }
  await Category.findByIdAndDelete(req.params.id)
  //2.send response to client
  return res.status(200).json({
    message: "category has been deleted successfully",
    categoryId: category._id,
  });
});
