"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controller/userController");
const router = (0, express_1.Router)();
// Auth routes
router.post("/register", userController_1.registerAdmin);
router.post("/login", userController_1.loginAdmin);
router.post("/logout", userController_1.logoutUser);
// Contact & Inquiries
router.post("/sendEmails", userController_1.sendEmails);
router.post("/form", userController_1.formData);
router.get("/messages", userController_1.getAllMessages);
router.delete("/delete-message/:id", userController_1.deleteMessage);
// Projects routes
router.get("/getPro", userController_1.getAllProjects);
router.get("/admin", userController_1.getAllProAdmin);
router.get("/details/:id", userController_1.getProjectsDetails);
router.post("/add-pro", userController_1.addProject);
router.delete("/delete-pro/:id", userController_1.deleteProject);
router.put("/update-pro/:id", userController_1.updateProject);
router.post("/add-mulImg", userController_1.addMultipleImage);
// Experience routes
router.get("/experience", userController_1.getAllExperience);
router.post("/add-experience", userController_1.addExperience);
router.put("/update-experience/:id", userController_1.updateExperience);
router.delete("/delete-experience/:id", userController_1.deleteExperience);
// Skills routes
router.get("/skills", userController_1.getAllSkills);
router.post("/add-skill", userController_1.addSkill);
router.delete("/delete-skill/:id", userController_1.deleteSkill);
// Education routes
router.get("/education", userController_1.getAllEducation);
router.post("/add-education", userController_1.addEducation);
router.put("/update-education/:id", userController_1.updateEducation);
router.delete("/delete-education/:id", userController_1.deleteEducation);
// Profile & Resume routes
router.get("/profile", userController_1.getProfile);
router.post("/update-profile", userController_1.updateProfile);
router.post("/upload-resume", userController_1.uploadResumeDoc);
exports.default = router;
