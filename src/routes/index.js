const express = require("express");
const router = express.Router();

router.use("/login", require("./login.route"));
router.use("/me", require("./me.route"));
router.use("/dashboard", require("./dashboard/dashboard.route"));
router.use("/projects",require("./projectPage/projectpage.route"));
router.use("/invitedprojects",require("./dashboard/invitedproject.route"));
router.use("/assets", require("./AssetsTab/assets.routes"));
router.use("/final", require("./FinalTab/final.route"));
router.use("/public", require("./public.route"));

module.exports = router;
