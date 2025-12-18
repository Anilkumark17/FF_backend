const { loginController } = require("./login.contoller");
const { currentUser } = require("./me.controller");
const {
  createProject,
  fetchAllProjects,
  editProject,
  deleteProject,
} = require("./dashboard/project.controller");
const currentProjectDetails = require("./ProjectPage/project.controller");

module.exports = {
  loginController,
  me: currentUser,
  createProject,
  fetchAllProjects,
  editProject,
  deleteProject,
  currentProjectDetails,
};
