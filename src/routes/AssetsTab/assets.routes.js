const express = require("express");
const { uploadAssets, getProjectAssets } = require("../../controllers/AssetsTab/assets.controller");
const upload = require("../../middleware/multer.middleware");
const { protected } = require("../../middleware");
const assetsRoute = express.Router();

assetsRoute.post("/upload", upload.single("file"), protected, uploadAssets);
assetsRoute.get("/:projectId", protected, getProjectAssets);

module.exports = assetsRoute;
