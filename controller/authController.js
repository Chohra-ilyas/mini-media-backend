const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const {
  User,
  validateLoginUser,
  validateRegisterUser,
} = require("../model/User");
const VerifcationToken = require("../model/VerificationToken");
/**
 * @desc Register new User
 * @route /api/auth/register
 * @method POST
 * @access public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { error } = validateRegisterUser(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  let user = await User.findOne({ email: req.body.email });

  if (user) {
    res.status(400).json({ message: "user already exist!!" });
  }

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  user = new User({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
  });

  await user.save();

  //Creating new verificationToken & save it to DB
  const verificationToken = new VerifcationToken({
    userId: user._id,
    token: crypto.randomBytes(32).toString("hex"),
  });

  await verificationToken.save();

  //making the link
  const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;

  //putting the link into an html template
  const htmlTemplate = `
  <div>
    <p>Click the link below to verify your email</p>
    <a href="${link}">Verify</a>
  </div>
  `;

  //sending email to the user
  await sendEmail(user.email, "Verify your email", htmlTemplate);

  res.status(201).json({
    message: "we sent to you an email, please verify your email address",
  });
});

/**
 * @desc Login User
 * @route /api/auth/login
 * @method POST
 * @access public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { error } = validateLoginUser(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  let user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(400).json({ message: "user not exist!!" });
  }

  const isPasswordMatch = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (isPasswordMatch) {
    if (!user.isAccountVerified) {
      let verificationToken = await VerifcationToken.findOne({
        userId: user._id,
      });

      if (!verificationToken) {
        verificationToken = new VerifcationToken({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        });
        await verificationToken.save();
      }

      const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;

      const htmlTemplate = `
      <div>
        <p>Click the link below to verify your email</p>
        <a href="${link}">Verify</a>
      </div>
      `;

      await sendEmail(user.email, "Verify your email", htmlTemplate);

      res.status(400).json({
        message: "we sent to you an email, please verify your email address",
      });
    }

    const token = user.generateToken();
    const { password, ...other } = user._doc;
    res.status(200).json({ other, token });
  }

  res.status(400).json({ message: "wrong password!!" });
});

/**
 * @desc Verify User Account
 * @route /api/auth/:userId/verify/:token
 * @method Get
 * @access public
 */
const verifyUserAccount = asyncHandler(async (req, res) => {
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

  user.isAccountVerified = true;
  await user.save();

  await VerifcationToken.findOneAndDelete({ token: req.params.token });
  return res.status(200).json({ message: "your account verified" });
});

module.exports = {
  registerUser,
  loginUser,
  verifyUserAccount,
};
