const jwt = require("jsonwebtoken");
const { errorResponse } = require("./responseHandler");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return errorResponse(res, "Authorization token missing", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return errorResponse(res, "Invalid token", 401);
  }
};

module.exports = authMiddleware;
