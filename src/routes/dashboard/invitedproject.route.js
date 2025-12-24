const express = require("express");
const { invitedProject } = require("../../controllers/");
const { protected } = require("../../middleware");
const invitedRoute = express.Router();

invitedRoute.get("/", protected, invitedProject);

module.exports = invitedRoute;
