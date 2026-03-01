const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ VERIFY SMTP CONNECTION
transporter.verify(function (error, success) {
  if (error) {
    console.log("SMTP Error:", error.message);
  } else {
    console.log("SMTP Server is ready to send emails");
  }
});

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

module.exports = {
  sendEmail,
};
