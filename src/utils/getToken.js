const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const getToken = () => {
  return jwt.sign({ email: email, id: id }, JWT_SECRET, { expiresIn: "1h" });
};

module.exports = getToken;