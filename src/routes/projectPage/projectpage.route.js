const express = require("express");
const { currentProjectDetails,sendInvite } = require("../../controllers");
const { protected } = require("../../middleware");

const projectPageRouter = express.Router();

projectPageRouter.get("/:id", protected, currentProjectDetails);
projectPageRouter.post('/:id/sendinvite',protected,sendInvite);

module.exports= projectPageRouter