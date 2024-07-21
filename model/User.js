const mongoose = require("mongoose");
const joi = require("joi");
const joipassword = require("joi-password-complexity");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 5,
      maxlength: 100,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    profilePhoto: {
      type: Object,
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
        publicId: null,
      },
    },
    bio: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate post that belong to this user when he/she Get his/her profile
UserSchema.virtual("posts", {
  ref: "Post",
  foreignField: "user",
  localField: "_id",
});

// generate token
UserSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, isAdmin: this.isAdmin },
    process.env.JTW_SECRET_KEY
  );
};

// user model
const User = mongoose.model("User", UserSchema);

//validation
const validateRegisterUser = (obj) => {
  const schema = joi.object({
    email: joi.string().trim().min(5).max(100).required().email(),
    username: joi.string().trim().required().min(5).max(200).required(),
    password: joipassword().required(),
  });

  return schema.validate(obj);
};

const validateLoginUser = (obj) => {
  const schema = joi.object({
    email: joi.string().trim().min(5).max(100).required().email(),
    password: joi.string().min(8).required(),
  });

  return schema.validate(obj);
};

const validateUpdateUser = (obj) => {
  const schema = joi.object({
    email: joi.string().trim().min(5).max(100).email(),
    username: joi.string().min(5).max(200),
    password: joipassword(),
    bio: joi.string(),
  });

  return schema.validate(obj);
};

module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
};
