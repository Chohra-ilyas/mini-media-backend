const express = require("express");
const xss = require("xss-clean");
const helmet = require("helmet");
const hpp = require("hpp");
const { connection } = require("./config/connectToDB");
const { errorHandler, notFound } = require("./middlewares/error");
const cors = require("cors");
const rateLimiting = require("express-rate-limit");
const { logger } = require("./middlewares/logger");
require("dotenv").config();

// Connection to data base
connection();

// Init app
const app = express();

//Middelwares
app.use(express.json());
app.use(logger);

//Security Headers(helmet)
app.use(helmet());

//Prevent Hpp(Http Param Pollution)
app.use(hpp());

//Prevent XSS(Cross Site Scripting) Attacks
app.use(xss());

//Rate limiting
app.use(
  rateLimiting({
    windowMs: 10 * 60 * 1000, //10 minutes
    max: 100,
  })
);

//Cors Policy
app.use(cors({ origin: "http://localhost:3000" }));

// Routes
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/userRoute"));
app.use("/api/posts", require("./routes/postRoute"));
app.use("/api/comments", require("./routes/commentRoute"));
app.use("/api/categories", require("./routes/categoryRoute"));
app.use("/api/password", require("./routes/passwordRoute"));

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
