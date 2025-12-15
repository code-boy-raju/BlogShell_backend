

const axios = require("axios");
require("dotenv").config();

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

async function sendEmail(to, subject, htmlContent) {
  try {
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          email: process.env.SENDER_EMAIL,
          name: process.env.SENDER_NAME || "BlogShell",
        },
        to: [{ email: to }],
        subject,
        htmlContent,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(" Email sent:", response.data);
    return response.data;
  } catch (error) {
    console.error(" Email sending failed:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { sendEmail };
