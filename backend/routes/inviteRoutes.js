const express = require("express");
const { uploadAndProcess, getUploadProgress } = require("../controllers/inviteController");
const upload = require("../middleware/uploadMiddleware"); // multer setup

const router = express.Router();

router.post("/upload", upload.any(), uploadAndProcess);
router.get("/progress/:jobGroupId", getUploadProgress);

module.exports = router;
