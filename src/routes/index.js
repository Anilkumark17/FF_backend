const express = require("express");
const router = express.Router();

router.use("/login", require("./login.route"));
router.use("/me", require("./me.route"));
router.use("/dashboard", require("./dashboard/dashboard.route"));
router.use("/projects",require("./projectPage/projectpage.route"))
module.exports = router;
