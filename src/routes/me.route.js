const express = require("express");
const { me } = require("../controllers");
const { protected } = require("../middleware");

const meRouter = express.Router();
meRouter.get("/",protected, me);

module.exports = meRouter;