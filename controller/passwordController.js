const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { User, validateEmail, validateNewPassword } = require("../model/User");
const VerifcationToken = require("../model/VerificationToken");

/**--------------------------------
 * @desc Send Reset Password Link
 * @route /api/password/reset-password-link
 * @method POST
 * @access public
-----------------------------------*/
module.exports.sendRestPasswordlLink = asyncHandler(async (req, res) => {
  //1-Validation
  const { error } = validateEmail(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  //2-Get user from DB by email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404).json({ message: "user not exist!!" });
  }

  //3-Creating verificationToken
  let verificationToken = await VerifcationToken.findOne({ userId: user._id });
  if (!verificationToken) {
    verificationToken = new VerifcationToken({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    });
    await verificationToken.save();
  }


  //4-Creating link
  const link = `${process.env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`;

  //5-Creating html template
  const htmlTemplate = `
  <div>
    <p>Click the link below to reset your password</p>
    <a href="${link}">Peset Password</a>
  </div>
  `;

  //6-Sending email
  await sendEmail(user.email, "Reset password", htmlTemplate);
  //7-Response to the client
  res.status(200).json({
    message: "Password link sent to your email,please check your email ",
  });
});

/**--------------------------------
 * @desc Get Reset Password Link
 * @route /api/password/reset-password/:userId/:token
 * @method GET
 * @access public
-----------------------------------*/
module.exports.getRestPasswordlLink = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({ message: "invalid user" });
  }

  const verificationToken = await VerifcationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });

  if (!verificationToken) {
    return res.status(400).json({ message: "invalid token" });
  }

  return res.status(200).json({ message: "valid url" });
});

/**--------------------------------
 * @desc Reset Password
 * @route /api/password/reset-password/:userId/:token
 * @method POST
 * @access public
-----------------------------------*/
module.exports.resetPasswordlLink = asyncHandler(async (req, res) => {
  //1-Validation
  const { error } = validateNewPassword(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({ message: "invalid user" });
  }

  const verificationToken = await VerifcationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });

  if (!verificationToken) {
    return res.status(400).json({ message: "invalid token" });
  }

  if(!user.isAccountVerified){
    user.isAccountVerified=true;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPaswword = await bcrypt.hash(req.body.password, salt);
  user.password = hashedPaswword;
  await user.save();
  await VerifcationToken.findOneAndDelete({ token: req.params.token });

  return res.status(200).json({ message: "password reset successfully" });
});
