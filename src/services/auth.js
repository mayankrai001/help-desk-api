const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signupService = async (payload) => {
  const { name, email, password, companyName } = payload;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10); // used salt value of 10 for hashing

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    companyName,
  });

  return {
    email: user.email,
    name: user.name,
    companyName: user.companyName,
    role: user.role,
  };
};

const loginService = async (payload) => {
  const { email, password } = payload;

  const user = await User.findOne({ email });

  console.log("++++ user +++++", user);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return {
    token,
    user: {
      email: user.email,
      name: user.name,
      companyName: user.companyName,
      role: user.role,
    },
  };
};

module.exports = {
  signupService,
  loginService,
};
