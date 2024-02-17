const { sendEmails, formData } = require("../controller/userController");

const router = require("express").Router();

router.post("/sendemail", sendEmails);
router.post("/form", formData);
module.exports = router;
