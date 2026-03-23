const User = require("../models/user.js");
const Organization = require("../models/organization.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const signupService = async (payload) => {
  const { name, email, password, companyName } = payload;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Find or create organization - same organization not added twice (unique name)
  const escapedName = companyName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let organization = await Organization.findOne({
    name: { $regex: new RegExp(`^${escapedName}$`, "i") },
  });
  if (!organization) {
    organization = await Organization.create({ name: companyName.trim() });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    organizationId: organization._id,
  });

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      organizationId: user.organizationId._id.toString(),
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return {
    token,
    user: {
      email: user.email,
      name: user.name,
      organizationId: user.organizationId._id,
      organizationName: user.organizationId.name,
      role: user.role,
    },
  };
};

const loginService = async (payload) => {
  const { email, password } = payload;

  const user = await User.findOne({ email }).populate("organizationId", "name");

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.organizationId) {
    throw new Error(
      "Account needs organization. Please contact support to migrate your account.",
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      organizationId: user.organizationId._id.toString(),
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return {
    token,
    user: {
      email: user.email,
      name: user.name,
      organizationId: user.organizationId._id,
      organizationName: user.organizationId.name,
      role: user.role,
    },
  };
};

const microsoftAuthService = async (code) => {
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;
  const tenantId = process.env.MS_TENANT_ID || "common";
  const redirectUri =
    process.env.MS_REDIRECT_URI ||
    "http://localhost:5000/auth/microsoft/callback";

  const tokenParams = new URLSearchParams({
    client_id: clientId,
    scope: "openid profile email User.Read",
    code: code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
    client_secret: clientSecret,
  });

  const tokenResponse = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    tokenParams.toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    },
  );

  const { access_token } = tokenResponse.data;

  const profileResponse = await axios.get(
    "https://graph.microsoft.com/v1.0/me",
    {
      headers: { Authorization: `Bearer ${access_token}` },
    },
  );
  const msUser = profileResponse.data;

  let companyName = "Microsoft Default Org";
  try {
    const orgResponse = await axios.get(
      "https://graph.microsoft.com/v1.0/organization",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );
    if (
      orgResponse.data &&
      orgResponse.data.value &&
      orgResponse.data.value.length > 0
    ) {
      companyName = orgResponse.data.value[0].displayName || companyName;
    }
  } catch (error) {
    console.warn("Could not fetch organization details:", error.message);
  }

  const escapedName = companyName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let organization = await Organization.findOne({
    name: { $regex: new RegExp(`^${escapedName}$`, "i") },
  });
  if (!organization) {
    organization = await Organization.create({ name: companyName.trim() });
  }

  const email = msUser.mail || msUser.userPrincipalName;
  let user = await User.findOne({
    $or: [{ microsoftId: msUser.id }, { email: email }],
  }).populate("organizationId", "name");

  if (!user) {
    user = await User.create({
      name: msUser.displayName || email.split("@")[0],
      email: email,
      microsoftId: msUser.id,
      organizationId: organization._id,
    });
    user.organizationId = organization;
  } else if (!user.microsoftId) {
    user.microsoftId = msUser.id;
    await user.save();
  }

  if (!user.organizationId) {
    throw new Error(
      "Account needs organization. Please contact support to migrate your account.",
    );
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      organizationId: user.organizationId._id
        ? user.organizationId._id.toString()
        : user.organizationId.toString(),
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return {
    token,
    user: {
      email: user.email,
      name: user.name,
      organizationId: user.organizationId._id || user.organizationId,
      organizationName: user.organizationId.name || organization.name,
      role: user.role,
    },
  };
};

module.exports = {
  signupService,
  loginService,
  microsoftAuthService,
};
