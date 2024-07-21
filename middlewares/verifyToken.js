const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authToken = req.headers.authorization;
  if (authToken) {
    const token = authToken.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JTW_SECRET_KEY);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "invalid token" });
    }
  } else {
    res.status(401).json({ message: "no token provided" });
  }
};

const verifyTokenAndOnlyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id) {
      next();
    } else {
      res.status(403).json({
        message: "you are not allowed ,only user himself!!",
      });
      //status 403 forbidden
    }
  });
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({
        message: "you are not allowed ,only user himself or admin!!",
      });
      //status 403 forbidden
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({
        message: "you are not allowed ,only Admin allowed!!",
      });
      //status 403 forbidden
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
  verifyTokenAndAuthorization
};
