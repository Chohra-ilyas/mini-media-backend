const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const { Comment } = require("../model/Comment");
const {
  Post,
  validateCreatepost,
  validateUpdatePost,
} = require("../model/Post");
const {
  cloudinaryUplaodImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");

/**
 * @desc Create post
 * @route /api/posts
 * @method POST
 * @access private (only login user)
 */
module.exports.createPost = asyncHandler(async (req, res) => {
  //1.validation for image
  if (!req.file) {
    return res.status(400).json({ message: "no image provided" });
  }

  //2.validation for data
  const { error } = validateCreatepost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  //3.upload photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUplaodImage(imagePath);

  //4.create new post and save it to DB
  const post = await Post.create({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    user: req.user.id,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });

  //5.send response to client
  res.status(201).json(post);

  //6.remove image from server
  fs.unlinkSync(imagePath);
});

/**
 * @desc Get All posts
 * @route /api/posts
 * @method GET
 * @access public
 */
module.exports.getAllPosts = asyncHandler(async (req, res) => {
  const POST_PER_PAGE = 3;
  const { category, pageNumber } = req.query;
  let posts;

  if (pageNumber) {
    posts = await Post.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else if (category) {
    posts = await Post.find({ category })
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else {
    posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  }
  res.status(200).json(posts);
});

/**
 * @desc Get single post
 * @route /api/posts/:id
 * @method GET
 * @access public
 */
module.exports.getSinglePost = asyncHandler(async (req, res) => {
  let post = await Post.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("comments");
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  res.status(200).json(post);
});

/**
 * @desc get posts count
 * @route api/posts/count
 * @method GET
 * @access public
 */
module.exports.getPostsCount = asyncHandler(async (req, res) => {
  const count = await Post.find();
  let i = 0;
  count.map(() => {
    i++;
  });
  res.status(200).json(i);
});

/**
 * @desc Update post
 * @route /api/posts/:id
 * @method PUT
 * @access private (user himself)
 */
module.exports.updatePost = asyncHandler(async (req, res) => {
  //1.validation for data
  const { error } = validateUpdatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  let post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  if (req.user.id === post.user.toString()) {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
        },
      },
      {
        new: true,
      }
    )
      .populate("user", ["-password"])
      .populate("comments");

    //send response
    return res.status(200).json(updatedPost);
  }
  res.status(403).json({
    message: "you are not allowed ,only user himself!!",
  });
});

/**
 * @desc Update post image
 * @route /api/posts/upload-image/:id
 * @method PUT
 * @access private (user himself)
 */
module.exports.updatePostImage = asyncHandler(async (req, res) => {
  //1.validation
  if (!req.file) {
    return res.status(400).json({ message: "no image provided" });
  }
  //2.check if post exist
  let post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  if (req.user.id !== post.user.toString()) {
    res.status(403).json({
      message: "you are not allowed ,only user himself!!",
    });
  }

  //3.check if his owner post

  //4.add new image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUplaodImage(imagePath);

  //5.remove old image
  await cloudinaryRemoveImage(post.image.publicId);

  //6.update image in DB
  post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    {
      new: true,
    }
  );
  //7.remove image from server
  fs.unlinkSync(imagePath);

  //8.send response
  return res.status(200).json({
    message: "post has been updated successfully",
    post,
    postId: post._id,
  });
});

/**
 * @desc toggle like
 * @route /api/posts/like/:id
 * @method PUT
 * @access private (only logged user)
 */
module.exports.toggleLike = asyncHandler(async (req, res) => {
  const loggedUser = req.user.id;

  let post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  const isPostLiked = post.likes.find((user) => user.toString() === loggedUser);

  if (isPostLiked) {
    post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likes: loggedUser },
      },
      { new: true }
    );
  } else {
    post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: { likes: loggedUser },
      },
      { new: true }
    );
  }

  res.status(200).json(post);
});

/**
 * @desc delete post
 * @route /api/posts/:id
 * @method DELETE
 * @access private (only admin or user himself)
 */
module.exports.deletePost = asyncHandler(async (req, res) => {
  let post = await Post.findById(req.params.id).populate("comments");
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  if (req.user.isAdmin || req.user.id === post.user.toString()) {
    await Post.findByIdAndDelete(req.params.id);
    await cloudinaryRemoveImage(post.image.publicId);

    //remove all comments of this post
    const toRemoveComment = post.comments;
    toRemoveComment?.map(async (comment) => {
      await Comment.findByIdAndDelete(comment._id.toString());
    });
    //send response
    return res.status(200).json({
      message: "post has been deleted successfully",
      postId: post._id,
    });
  }
  res.status(403).json({
    message: "you are not allowed ,only user himself or admin!!",
  });
});
