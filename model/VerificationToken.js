const mongoose = require("mongoose");

//Verifcation Token Schema
const VerifcationTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

//Verifcation Token Model
const VerifcationToken = mongoose.model(
  "verifcationToken",
  VerifcationTokenSchema
);

module.exports = VerifcationToken;
