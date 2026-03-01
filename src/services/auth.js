const User = require("../models/user.js");
const Organization = require("../models/organization.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

module.exports = {
  signupService,
  loginService,
};
