const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const { User, validateUpdateUser } = require("../model/User");
const { Comment } = require("../model/Comment");
const { Post } = require("../model/Post");
const {
  cloudinaryUplaodImage,
  cloudinaryRemoveImage,
  cloudinaryRemoveMultipleImage,
} = require("../utils/cloudinary");
/**
 * @desc get all users
 * @route api/user/profile
 * @method GET
 * @access private (only Admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json(users);
});

/**
 * @desc get users count
 * @route api/user/count
 * @method GET
 * @access private (only Admin)
 */
const getUsersCount = asyncHandler(async (req, res) => {
  const count = await User.find();
  let i = 0;
  count.map(() => {
    i++;
  });
  res.status(200).json(i);
});

/**
 * @desc Get user profile
 * @route /api/users/profile/:id
 * @method GET
 * @access private
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("posts");
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(400).json({ message: "wrong id ,try another one!!" });
  }
});

/**
 * @desc Update User by ID
 * @route /api/users/profile/:id
 * @method PUT
 * @access private
 */
const updateUser = asyncHandler(async (req, res) => {
  const { error } = validateUpdateUser(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  const updateUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        bio: req.body.bio,
      },
    },
    {
      new: true,
    }
  )
    .select("-password")
    .populate("posts");

  res.status(200).json(updateUser);
});

/**
 * @desc delete user by ID
 * @route /api/users/:id
 * @method DELETE
 * @access private
 */
const deleteUser = asyncHandler(async (req, res) => {
  //1.Get user from DB
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(400).json({ message: "user not found!!" });
  }

  //2.Get all posts from DB
  const posts = await Post.find({ user: user._id });

  //3.Get the public ids from the posts
  const publicIds = posts?.map((post) => post.image.publicId);

  //.Delete all posts image from cloudinary that belong to this user
  if (publicIds?.length > 0) {
    await cloudinaryRemoveMultipleImage(publicIds);
  }

  //5.Delete user profile picture from cloudinary
  if (user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }

  //6.Delete user posts & comments
  await Post.deleteMany({ user: user._id });
  await Comment.deleteMany({ user: user._id });

  //7.Delete user himself
  await User.findByIdAndDelete(req.params.id);

  //8.send response to client
  res.status(200).json({
    message: "user deleted seccessfully",
    userId:user._id
  });
});

/**
 * @desc upload photo profile
 * @route api/user/profile/profile-photo-update/:id
 * @method POST
 * @access private (user himself)
 */

const profilePhotoUpdate = asyncHandler(async (req, res) => {
  //1.validation
  if (!req.file) {
    res.status(400).json({ message: "no file provided" });
  }
  if (req.user.id !== req.params.id) {
    res.status(403).json({ message: "you are not allowed" });
  }

  //2.Get the path to the image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

  //3.uplaod to cloudinary
  const result = await cloudinaryUplaodImage(imagePath);

  //4.Get user from DB
  const user = await User.findById(req.user.id);

  //5.delete the old photo if exist
  if (user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }

  //6.change the profilephoto field in DB
  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await user.save();

  //7.send response to the client
  res.status(200).json({
    message: "your profile photo has updated successfully",
    profilePhoto: { url: result.secure_url, publicId: result.public_id },
  });
  //8.remove image from server
  fs.unlinkSync(imagePath);
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  getUsersCount,
  profilePhotoUpdate,
  deleteUser,
};
