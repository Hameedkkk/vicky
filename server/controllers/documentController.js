const fs = require("fs");
const path = require("path");
const Document = require("../models/Document");
const DownloadHistory = require("../models/DownloadHistory");
const User = require("../models/User");
const { encryptFile, decryptFile } = require("../utils/encryption");

// Comprehensive list of allowed file types
const ALLOWED_MIME_TYPES = [
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
  "image/webp",
  "image/tiff",
  "image/x-icon",
  // Video
  "video/mp4",
  "video/webm",
  "video/x-msvideo",
  "video/quicktime",
  "video/x-matroska",
  "video/x-flv",
  "video/x-ms-wmv",
  "video/x-m4v",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/aac",
  "audio/flac",
  "audio/x-m4a",
  "audio/x-ms-wma",
  // Archives
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/x-tar",
  "application/gzip",
  // Code & Data
  "text/javascript",
  "text/python",
  "text/x-python",
  "text/css",
  "text/html",
  "text/xml",
  "application/json",
  "text/csv",
  "application/sql",
  "text/x-shellscript",
];

const ALLOWED_EXTENSIONS = [
  // Documents
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".odt",
  ".ods",
  ".odp",
  // Images
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".svg",
  ".webp",
  ".tiff",
  ".ico",
  // Video
  ".mp4",
  ".webm",
  ".avi",
  ".mov",
  ".mkv",
  ".flv",
  ".wmv",
  ".m4v",
  // Audio
  ".mp3",
  ".wav",
  ".ogg",
  ".aac",
  ".flac",
  ".m4a",
  ".wma",
  // Archives
  ".zip",
  ".rar",
  ".7z",
  ".tar",
  ".gz",
  // Code & Data
  ".js",
  ".py",
  ".css",
  ".html",
  ".xml",
  ".json",
  ".csv",
  ".sql",
  ".sh",
];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_TOTAL_SIZE = 1 * 1024 * 1024 * 1024; // 1GB

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    const userId = req.user.id;
    const file = req.file;

    // Validate file type
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        message:
          "File type not supported. Please upload documents, images, videos, audio, archives, or code files.",
      });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        message: "File size exceeds 100MB limit",
      });
    }

    // Check total storage used
    const existingDocuments = await Document.find({ userId });
    const totalSize = existingDocuments.reduce(
      (sum, doc) => sum + doc.fileSize,
      0,
    );

    if (totalSize + file.size > MAX_TOTAL_SIZE) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        message: "Storage limit exceeded (1GB per user)",
      });
    }

    // Read file and encrypt
    const fileBuffer = fs.readFileSync(file.path);
    const { iv, encryptedData } = encryptFile(fileBuffer);

    // Delete original unencrypted file
    fs.unlinkSync(file.path);

    // Create encrypted file
    const encryptedFileName = `${Date.now()}_${userId}`;
    const encryptedFilePath = path.join(
      __dirname,
      "../uploads",
      encryptedFileName,
    );

    // Store encrypted file with IV prepended
    const fileWithIv = Buffer.concat([
      Buffer.from(iv),
      Buffer.from(encryptedData, "hex"),
    ]);

    fs.writeFileSync(encryptedFilePath, fileWithIv);

    // Save document metadata to database
    const document = await Document.create({
      userId,
      originalFileName: file.originalname,
      encryptedFilePath: encryptedFileName,
      fileSize: file.size,
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Upload error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};

// @desc    Get all documents for user
// @route   GET /api/documents
// @access  Private
exports.getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    const documents = await Document.find({ userId }).sort({ uploadDate: -1 });

    // Calculate storage used
    const totalStorageUsed = documents.reduce(
      (sum, doc) => sum + doc.fileSize,
      0,
    );

    res.status(200).json({
      success: true,
      count: documents.length,
      totalStorageUsed,
      storageLimit: MAX_TOTAL_SIZE,
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve documents",
    });
  }
};

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private
exports.downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find document
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check if user owns the document
    if (document.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to download this document",
      });
    }

    // Read encrypted file
    const encryptedFilePath = path.join(
      __dirname,
      "../uploads",
      document.encryptedFilePath,
    );

    if (!fs.existsSync(encryptedFilePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const fileWithIv = fs.readFileSync(encryptedFilePath);

    // Extract IV (first 32 characters = 16 bytes in hex)
    const iv = fileWithIv.slice(0, 32).toString();
    const encryptedData = fileWithIv.slice(32).toString("hex");

    // Decrypt file
    const decryptedBuffer = decryptFile(encryptedData, iv);

    // Create download history record
    await DownloadHistory.create({
      userId,
      documentId: id,
    });

    // Send file
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.originalFileName}"`,
    );
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(decryptedBuffer);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      message: "Download failed",
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find document
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check if user owns the document
    if (document.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this document",
      });
    }

    // Delete physical file
    const encryptedFilePath = path.join(
      __dirname,
      "../uploads",
      document.encryptedFilePath,
    );
    if (fs.existsSync(encryptedFilePath)) {
      fs.unlinkSync(encryptedFilePath);
    }

    // Delete from database
    await Document.findByIdAndDelete(id);

    // Delete associated download history
    await DownloadHistory.deleteMany({ documentId: id });

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};

// @desc    Get user storage stats
// @route   GET /api/documents/stats/storage
// @access  Private
exports.getStorageStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const documents = await Document.find({ userId });
    const totalStorageUsed = documents.reduce(
      (sum, doc) => sum + doc.fileSize,
      0,
    );

    res.status(200).json({
      success: true,
      totalStorageUsed,
      storageLimit: MAX_TOTAL_SIZE,
      remainingStorage: MAX_TOTAL_SIZE - totalStorageUsed,
      fileCount: documents.length,
    });
  } catch (error) {
    console.error("Storage stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get storage stats",
    });
  }
};

// @desc    Get download history
// @route   GET /api/documents/history
// @access  Private
exports.getDownloadHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await DownloadHistory.find({ userId })
      .populate("documentId")
      .sort({ downloadDate: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("Download history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get download history",
    });
  }
};
