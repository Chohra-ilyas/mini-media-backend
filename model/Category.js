const mongoose = require("mongoose");
const joi = require("joi");

const CategorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

//Category Model
const Category = mongoose.model("Category", CategorySchema);

//validate create category
const validateCreateCategory = (obj) => {
  const schema = joi.object({
    title: joi.string().trim().required(),
  });

  return schema.validate(obj);
};

module.exports = {
  Category,
  validateCreateCategory,
};
