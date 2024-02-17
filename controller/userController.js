const asynchandler = require("express-async-handler");
const sendEmail = require("../utils/email");
const User = require("../model/User");
exports.sendEmails = asynchandler(async (req, res) => {
  const { email, subject, message } = req.body;
  console.log(email);
  await sendEmail({
    email: email,
    subject: subject,
    message: message,
  });
  res.status(200).json({ message: "Email send success" });
});

// add to db
exports.formData = asynchandler(async (req, res) => {
  await User.create(req.body);
  res.status(200).json({ message: "formData added Success" });
});
