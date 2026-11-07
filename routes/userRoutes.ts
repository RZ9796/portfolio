import { Router } from "express";
import {
  sendEmails,
  formData,
  updateProject,
  deleteProject,
  addProject,
  getAllProjects,
  getProjectsDetails,
  addMultipleImage,
  registerAdmin,
  loginAdmin,
  getAllProAdmin,
  logoutUser,
  getAllExperience,
  addExperience,
  updateExperience,
  deleteExperience,
  getAllSkills,
  addSkill,
  deleteSkill,
  getAllMessages,
  deleteMessage,
  getAllEducation,
  addEducation,
  updateEducation,
  deleteEducation,
  getProfile,
  updateProfile,
  uploadResumeDoc,
} from "../controller/userController";

const router = Router();

// Auth routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutUser);

// Contact & Inquiries
router.post("/sendEmails", sendEmails);
router.post("/form", formData);
router.get("/messages", getAllMessages);
router.delete("/delete-message/:id", deleteMessage);

// Projects routes
router.get("/getPro", getAllProjects);
router.get("/admin", getAllProAdmin);
router.get("/details/:id", getProjectsDetails);
router.post("/add-pro", addProject);
router.delete("/delete-pro/:id", deleteProject);
router.put("/update-pro/:id", updateProject);
router.post("/add-mulImg", addMultipleImage);

// Experience routes
router.get("/experience", getAllExperience);
router.post("/add-experience", addExperience);
router.put("/update-experience/:id", updateExperience);
router.delete("/delete-experience/:id", deleteExperience);

// Skills routes
router.get("/skills", getAllSkills);
router.post("/add-skill", addSkill);
router.delete("/delete-skill/:id", deleteSkill);

// Education routes
router.get("/education", getAllEducation);
router.post("/add-education", addEducation);
router.put("/update-education/:id", updateEducation);
router.delete("/delete-education/:id", deleteEducation);

// Profile & Resume routes
router.get("/profile", getProfile);
router.post("/update-profile", updateProfile);
router.post("/upload-resume", uploadResumeDoc);

export default router;

