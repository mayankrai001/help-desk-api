const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: to,
      subject: subject,
      html: html,
    });

    console.log("Email sent:", response);
  } catch (error) {
    console.error("Email error:", error);
  }
};

module.exports = {
  sendEmail,
};
