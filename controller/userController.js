const asynchandler = require("express-async-handler");
const sendEmail = require("../utils/email");
const User = require("../model/User");
const Admin = require("../model/Admin");
const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uploadGallery } = require("../utils/upload");
const login = require("../model/login");

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

exports.getAllProAdmin = asynchandler(async (req, res) => {
  const result = await Admin.find();
  console.log(result);
  res.status(200).json({ message: "projects data fetched", result });
});
exports.getAllProjects = asynchandler(async (req, res) => {
  const result = await Admin.find();
  console.log(result);
  res.status(200).json({ message: "projects data fetched", result });
});
exports.getProjectsDetails = asynchandler(async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  const result = await Admin.findById(id);
  // console.log(result);
  res.status(200).json({ message: "projects data fetched", result });
});
exports.addProject = asynchandler(async (req, res) => {
  uploadGallery(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: err.message || "unable to upload" });
    }
    // console.log(req.file);
    const { name, desc, link } = req.body;
    const arr = [];
    for (const item of req.files) {
      arr.push(item.filename);
    }
    console.log("arr", arr);
    if (req.files) {
      await Admin.create({
        name: name,
        desc,
        link,
        // image: req.file.filename,
        mulImage: arr,
      });
    } else {
      await Admin.create({ name: name, desc, link });
    }
    res.status(201).json({ message: "project add  success" });
  });
});
exports.updateProject = asynchandler(async (req, res) => {
  uploadGallery(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: err.message || "unable to Update image" });
    }
    const { id } = req.params;
    const result = await Admin.findById(id);
    // console.log("res :==", result);
    const { removeItems, name, desc, link } = req.body;
    console.log("xxxxx", removeItems);
    if (removeItems && removeItems.length >= 1 && req.files) {
      // new img images + remove
      for (const item of removeItems) {
        await fs.unlink(path.join(__dirname, "..", "projectMultiImages", item));
      }

      const arr = result.mulImage.filter((item) => !removeItems.includes(item));
      for (const item of req.files) {
        arr.push(item.filename);
      }
      console.log("array", arr);
      await Admin.findByIdAndUpdate(id, {
        name: name,
        desc: desc,
        link: link,
        mulImage: arr,
      });
      // deleteing specific images
    } else if (removeItems && removeItems.length >= 1) {
      for (const item of removeItems) {
        fs.unlink(path.join(__dirname, "..", "projectMultiImages", item));
      }

      const arr = result.mulImage.filter((item) => !removeItems.includes(item));
      await Admin.findByIdAndUpdate(id, {
        name: name,
        desc: desc,
        link: link,
        mulImage: arr,
      });
    } else {
      await Admin.findByIdAndUpdate(id, {
        name: name,
        desc: desc,
        link: link,
      });
    }
    res.status(200).json({ message: "user update success" });
  });
});
exports.deleteProject = asynchandler(async (req, res) => {
  //
  const { id } = req.params;
  const result = await Admin.findById(id);
  // console.log("update", result);
  if (result && result.mulImage) {
    for (const item of result.mulImage) {
      fs.unlink(path.join(__dirname, "..", "projectMultiImages", item));
    }
    await Admin.findByIdAndDelete(id);
    res.json({ message: "image delete success" });
  } else {
    res.json({ message: "Invalid id" });
  }
});

// for many images

exports.addMultipleImage = asynchandler(async (req, res) => {
  uploadGallery(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: err.message || "unable to upload file " });
    }
    console.log(req.files);
    const arr = [];
    for (const item of req.files) {
      arr.push(item.filename);
    }
    await Admin.create({ name: req.body.name, multiImage: arr });
    res.json({ messge: "images Added success" });
  });
});

//login
exports.registerAdmin = async (req, res) => {
  try {
    const { password } = req.body;
    console.log(req.body);
    //its called as salt which generate length of password
    const hashPass = await bcrypt.hash(password, 10);
    await login.create({ ...req.body, password: hashPass });
    res.status(201).json({ message: "login Register Success" });
  } catch (error) {
    res.status(500).json({
      message: error.message || "something went wrong",
    });
  }
};
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // check email & pass validation then login
    console.log("LOGIN BODY", req.body);
    const result = await login.findOne({ email });
    console.log("LOGIN BODY", result);
    if (!result) {
      return res.status(401).json({ message: "invalid email" });
    }
    // check pass
    const verify = await bcrypt.compare(password, result.password);
    if (!verify) {
      return res.status(401).json({ message: "invalid password" });
    }

    // generate token
    const token = jwt.sign({ userId: result._id }, process.env.JWT_KEY, {
      expiresIn: "1d",
    });
    // send via cookie
    res.cookie("auth", token, { maxAge: 3600000 * 6 });
    // token/ login
    res.status(201).json({
      message: "User Login Success",
      // result: {
      //   name: result.name,
      //   id: result._id,
      // },
      result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "something went wrong",
    });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("auth");
    res.status(201).json({ message: "User Logout " });
  } catch (error) {
    res.status(500).json({
      message: error.message || "something went wrong",
    });
  }
};
