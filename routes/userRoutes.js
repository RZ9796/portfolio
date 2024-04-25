const {
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
} = require("../controller/userController");

const router = require("express").Router();

// login
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutUser);

router.post("/sendEmails", sendEmails);
router.post("/form", formData);
// projects routes
router.get("/getPro", getAllProjects);
router.get("/admin", getAllProAdmin);
router.get("/details/:id", getProjectsDetails);
router.post("/add-pro", addProject);
router.delete("/delete-pro/:id", deleteProject);
router.put("/update-pro/:id", updateProject);
//
router.post("/add-mulImg", addMultipleImage);

module.exports = router;
