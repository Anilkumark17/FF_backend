const express = require("express");
const { 
  getPublicFinalOutput, 
  addPublicComment,
  getPublicComments 
} = require("../controllers/public.controller");

const publicRoute = express.Router();

// Get final output publicly (no auth)
publicRoute.get("/final/:id", getPublicFinalOutput);

// Add public comment (no auth, requires name in body)
publicRoute.post("/final/:id/comment", addPublicComment);

// Get all comments publicly (no auth)
publicRoute.get("/final/:id/comments", getPublicComments);

module.exports = publicRoute;
