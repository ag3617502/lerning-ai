const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { uploadDocument } = require("../controllers/documentController");

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = "uploads/";
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

router.post("/upload/:conversationId", protect, upload.single("document"), uploadDocument);

module.exports = router;
