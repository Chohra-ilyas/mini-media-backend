const asyncHandler = require("express-async-handler");
const {
  validateCreateComment,
  Comment,
  validateUpdateComment,
} = require("../model/Comment");
const { User } = require("../model/User");

/**
 * @desc Create new comment
 * @route /api/comments
 * @method POST
 * @access private (only logged user)
 */
module.exports.createComment = asyncHandler(async (req, res) => {
  //1.validate data
  const { error } = validateCreateComment(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  //2.Get user
  const profile = await User.findById(req.user.id);

  //3.create comment
  const comment = await Comment.create({
    postId: req.body.postId,
    text: req.body.text,
    user: req.user.id,
    username: profile.username,
  });

  //4.send response to client
  res.status(201).json(comment);
});

/**
 * @desc Get all comment
 * @route /api/comments
 * @method GET
 * @access private (only admin)
 */
module.exports.getAllComments = asyncHandler(async (req, res) => {
  //1.Get comments
  const comments = await Comment.find().populate("user");

  //2.send response to client
  res.status(200).json(comments);
});

/**
 * @desc update comment
 * @route /api/comments/:id
 * @method PUT
 * @access private (only user himself)
 */
module.exports.updateComment = asyncHandler(async (req, res) => {
  //1.validate data
  const { error } = validateUpdateComment(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  //2.Get comments
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: "comment not found" });
  }

  //3.Authorization
  if (req.user.id === comment.user.toString()) {
    //4.update comment
    const updateComment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          text: req.body.text,
        },
      },
      {
        new: true,
      }
    );
    //4.send response to client
    res.status(201).json({
      message: "comment has updated successfully!",
      updateComment,
    });
  } else {
    res.status(403).json({
      message: "you are not allowed ,only user himself!!",
    });
  }
});

/**
 * @desc Delete comment
 * @route /api/comments/:id
 * @method DELETE
 * @access private (only admin or owner of the comment)
 */
module.exports.deleteComment = asyncHandler(async (req, res) => {
  //.Get comments
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: "comment not found" });
  }

  //.Authorization
  if (req.user.isAdmin || req.user.id === comment.user.toString()) {
    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "comment has been deleted successfully!" });
  } else {
    res.status(403).json({
      message: "you are not allowed ,only user himself or admin!!",
    });
  }
});
