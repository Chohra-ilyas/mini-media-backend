const mongoose = require("mongoose");

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("connect to DB.....");
  } catch (error) {
    console.log("connection failed!", error);
  }
};

module.exports = { connection };
