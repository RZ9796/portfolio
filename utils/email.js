const nodemailer = require("nodemailer");
const sendEmail = ({ email, subject, message }) =>
  new Promise((resolve, reject) => {
    try {
      const mailer = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.FROM_EMAIL,
          pass: process.env.EMAIL_PASS,
        },
      });

      //   console.log(to);
      mailer.sendMail(
        {
          from: process.env.FROM_EMAIL,
          to: process.env.FROM_EMAIL,
          email,
          subject,
          text: message,
        },
        (err) => {
          if (err) {
            console.log(err);
            reject(err.message);
          }
          console.log("Email Send Success");
          resolve("Email Send Success");
        }
      );
    } catch (error) {
      console.log(error);
      reject(error.message);
    }
  });

module.exports = sendEmail;
