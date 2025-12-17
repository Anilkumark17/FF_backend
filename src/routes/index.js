const express = require("express");
const router = express.Router();

router.use("/login", require("./login.route"));
router.use("/me", require("./me.route"));

module.exports = router;