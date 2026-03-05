const mongoose = require("mongoose");

const downloadHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },
  downloadDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("DownloadHistory", downloadHistorySchema);
