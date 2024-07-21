const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../images"));
  },
  filename: (req, file, cb) => {
    if (file) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    } else {
      cb(null, false);
    }
  },
});

const upload = multer({
  storage: photoStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb({ message: "unsupported file format" }, false);
    }
  },
  limits: { fileSize: 1024 * 1024 * 1 }, // 1 --> 1 megabyte
});

module.exports = {
  upload,
};
