const express = require("express");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const {
  uploadDocument,
  getDocuments,
  downloadDocument,
  deleteDocument,
  getStorageStats,
  getDownloadHistory,
} = require("../controllers/documentController");

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `temp_${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Routes
router.post("/upload", authMiddleware, upload.single("file"), uploadDocument);
router.get("/", authMiddleware, getDocuments);
router.get("/stats/storage", authMiddleware, getStorageStats);
router.get("/history", authMiddleware, getDownloadHistory);
router.get("/:id/download", authMiddleware, downloadDocument);
router.delete("/:id", authMiddleware, deleteDocument);

module.exports = router;
