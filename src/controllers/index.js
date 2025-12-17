const { loginController } = require("./login.contoller");
const { currentUser } = require("./me.controller");

module.exports = {
  loginController,
  me: currentUser
};