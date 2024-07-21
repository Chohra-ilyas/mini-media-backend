const express = require("express");
const { connection } = require("./config/connectToDB");
const { errorHandler, notFound } = require("./middlewares/error");
const { logger } = require("./middlewares/logger");
require("dotenv").config();

// Connection to data base
connection();

// Init app
const app = express();

//Middelwares
app.use(express.json());
app.use(logger)

// Routes
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/userRoute"));
app.use("/api/posts", require("./routes/postRoute"));
app.use("/api/comments", require("./routes/commentRoute"));
app.use("/api/categories", require("./routes/categoryRoute"));

// Error Handler Middelware
app.use(notFound);
app.use(errorHandler);

//Running the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});
