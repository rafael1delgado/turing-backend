const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendEmail(email, subject, html) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "turingwallet@gmail.com",
      pass: process.env.EMAIL_PASS,
    },
  });
  transporter.sendMail(
    {
      from: "Turing Wallet <turingwallet@gmail.com>",
      to: email,
      subject: subject,
      html: html
    },
    function (error) {
      if (error) {
        console.log(error);
      }
    }
  );
}


module.exports = { sendEmail };
