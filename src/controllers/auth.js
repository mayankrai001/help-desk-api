const {
  signupService,
  loginService,
  microsoftAuthService,
} = require("../services/auth");
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

const microsoftLogin = async (req, res) => {
  try {
    const clientId = process.env.MS_CLIENT_ID;
    const tenantId = process.env.MS_TENANT_ID || "common";
    const redirectUri =
      process.env.MS_REDIRECT_URI ||
      "http://localhost:5000/auth/microsoft/callback";

    const scope = "User.Read Organization.Read.All openid profile email";

    const loginUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=${encodeURIComponent(scope)}`;

    res.redirect(loginUrl);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const microsoftCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:8080";
      return res.redirect(`${frontendBaseUrl}/auth/microsoft/callback?error=Authorization+code+not+provided`);
    }

    const data = await microsoftAuthService(code);
    const { token, user } = data;
    
    const encodedUser = encodeURIComponent(JSON.stringify(user));
    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    
    const frontendUrl = `${frontendBaseUrl}/auth/microsoft/callback?token=${token}&user=${encodedUser}`;
    return res.redirect(frontendUrl);

  } catch (error) {
    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    return res.redirect(`${frontendBaseUrl}/auth/microsoft/callback?error=${encodeURIComponent(error.message)}`);
  }
};

module.exports = {
  signup,
  login,
  microsoftLogin,
  microsoftCallback,
};
