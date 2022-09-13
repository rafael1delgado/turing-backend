const nodemailer = require("nodemailer");
require("dotenv").config();

function sendEmail(email, subject, text) {
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
      text: text,
    },
    function (error) {
      if (error) {
        console.log(error);
      }
    }
  );
}


module.exports = { sendEmail };
