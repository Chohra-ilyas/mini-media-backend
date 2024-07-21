const mongoose = require("mongoose");

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: "invalid id!" });
  }
  next();
};

module.exports = {
  validateObjectId,
};
