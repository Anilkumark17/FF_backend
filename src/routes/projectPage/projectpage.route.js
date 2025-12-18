const express = require("express");
const { currentProjectDetails } = require("../../controllers");
const { protected } = require("../../middleware");

const projectPageRouter = express.Router();

projectPageRouter.get("/:id", protected, currentProjectDetails);

module.exports= projectPageRouter