const { signupService, loginService } = require("../services/auth");
const {
  successResponse,
  errorResponse,
} = require("../middlewares/responseHandler");

const signup = async (req, res) => {
  try {
    const user = await signupService(req.body);
    return successResponse(res, user, "User registered successfully", 200);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const login = async (req, res) => {
  try {
    const data = await loginService(req.body);
    return successResponse(res, data, "Login successful");
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};

module.exports = {
  signup,
  login,
};
