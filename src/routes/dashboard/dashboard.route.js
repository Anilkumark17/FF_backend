const express = require("express");
const {
  createProject,
  fetchAllProjects,
  editProject,
  deleteProject,
} = require("../../controllers/index");

const { protected } = require("../../middleware");
const dashboardRoute = express.Router();

dashboardRoute.post("/", protected, createProject);
dashboardRoute.get("/", protected, fetchAllProjects);
dashboardRoute.patch("/", editProject);
dashboardRoute.delete("/:id", protected, deleteProject);

module.exports = dashboardRoute;
