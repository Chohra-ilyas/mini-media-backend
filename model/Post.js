const mongoose = require("mongoose");
const joi = require("joi");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate comment that belong to this user when he/she Get his/her post
PostSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "postId",
  localField: "_id",
});

const Post = mongoose.model("Post", PostSchema);

//validation create post
const validateCreatepost = (obj) => {
  const schema = joi.object({
    title: joi.string().trim().min(2).max(200).required(),
    description: joi.string().trim().min(10).required(),
    category: joi.string().trim().required(),
  });

  return schema.validate(obj);
};

//validation Update post
const validateUpdatepost = (obj) => {
  const schema = joi.object({
    title: joi.string().trim().min(2).max(200),
    description: joi.string().trim().min(10),
    category: joi.string().trim(),
  });

  return schema.validate(obj);
};

module.exports = {
  Post,
  validateCreatepost,
  validateUpdatepost,
};
