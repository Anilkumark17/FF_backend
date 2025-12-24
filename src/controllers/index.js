const { loginController } = require("./login.contoller");
const { currentUser } = require("./me.controller");
const {
  createProject,
  fetchAllProjects,
  editProject,
  deleteProject,
} = require("./dashboard/project.controller");
const {
  currentProjectDetails,
  sendInvite,
} = require("./ProjectPage/project.controller");
const invitedProject = require("./dashboard/invitedProject.controller");

module.exports = {
  loginController,
  me: currentUser,
  createProject,
  fetchAllProjects,
  editProject,
  deleteProject,
  currentProjectDetails: currentProjectDetails,
  sendInvite: sendInvite,
  invitedProject:invitedProject
};
