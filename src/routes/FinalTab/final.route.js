const express = require("express");
const { 
  finalUploadAssets, 
  getFinalOutputs, 
  getFinalOutputById,
  addComment,
  getComments 
} = require("../../controllers/Final/final.controller");
const upload = require("../../middleware/multer.middleware");
const { protected } = require("../../middleware");
const finalRoute = express.Router();

// Upload final work
finalRoute.post("/upload", upload.single("file"), protected, finalUploadAssets);

// Get all final outputs for a project
finalRoute.get("/:projectId", protected, getFinalOutputs);

// Get single final output by ID
finalRoute.get("/detail/:id", protected, getFinalOutputById);

// Add comment to final output
finalRoute.post("/:id/comment", protected, addComment);

// Get all comments for a final output
finalRoute.get("/:id/comments", protected, getComments);

module.exports = finalRoute;
