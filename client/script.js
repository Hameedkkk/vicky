// ==========================================
// Smart Digital Locker - Main Script
// ==========================================

// API Configuration
const API_BASE = "";

// ==========================================
// Password Visibility Toggle
// ==========================================

function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  const button = field.parentElement.querySelector(".password-toggle");

  if (field.type === "password") {
    field.type = "text";
    button.textContent = "🙈";
  } else {
    field.type = "password";
    button.textContent = "👁️";
  }
}

// Get token from localStorage
const getToken = () => localStorage.getItem("token");

// Check if user is logged in
const checkAuth = () => {
  const token = getToken();
  if (
    !token &&
    !window.location.pathname.includes("/login") &&
    !window.location.pathname.includes("/register") &&
    window.location.pathname !== "/"
  ) {
    window.location.href = "/login";
  }
};

// ==========================================
// Dashboard Functions
// ==========================================

// Switch page
function switchPage(pageName) {
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => page.classList.remove("active"));

  const page = document.getElementById(pageName);
  if (page) {
    page.classList.add("active");
  }

  // Update sidebar
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => item.classList.remove("active"));
  const activeItem = document.querySelector(`[data-page="${pageName}"]`);
  if (activeItem) {
    activeItem.classList.add("active");
  }

  // Update header title
  const titleMap = {
    overview: "Overview",
    documents: "My Documents",
    upload: "Upload Document",
    history: "Download History",
  };
  document.getElementById("pageTitle").textContent =
    titleMap[pageName] || "Dashboard";

  // Load data for specific pages
  if (pageName === "documents") {
    loadDocuments();
  } else if (pageName === "history") {
    loadDownloadHistory();
  }
}

// Load user data
async function loadUserData() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();
    if (data.success) {
      document.getElementById("userName").textContent = data.user.name;
    }
  } catch (error) {
    console.error("Error loading user data:", error);
  }
}

// Load storage stats
async function loadStorageStats() {
  try {
    const response = await fetch(`${API_BASE}/api/documents/stats/storage`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();
    if (data.success) {
      const stats = data;

      // Update stats cards
      document.getElementById("fileCount").textContent = stats.fileCount;

      const storageMB = (stats.totalStorageUsed / (1024 * 1024)).toFixed(2);
      document.getElementById("storageUsed").textContent = `${storageMB} MB`;
      document.getElementById("storageLimit").textContent = `of 1 GB`;

      // Update storage bar
      const percentage = (stats.totalStorageUsed / stats.storageLimit) * 100;
      document.getElementById("storageBar").style.width = percentage + "%";

      // Update storage info
      document.getElementById("storageInfo").textContent =
        `${storageMB} MB used out of 1 GB`;

      // Warn if storage is getting full
      if (percentage > 80) {
        document.getElementById("storageInfo").style.color =
          "var(--warning-color)";
      } else if (percentage > 95) {
        document.getElementById("storageInfo").style.color =
          "var(--error-color)";
      }
    }
  } catch (error) {
    console.error("Error loading storage stats:", error);
  }
}

// Load documents
async function loadDocuments() {
  try {
    const response = await fetch(`${API_BASE}/api/documents`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();
    if (data.success) {
      const documentsList = document.getElementById("documentsList");

      if (data.count === 0) {
        documentsList.innerHTML =
          '<p class="empty-state">No documents uploaded yet</p>';
        return;
      }

      documentsList.innerHTML = data.documents
        .map(
          (doc) => `
        <div class="document-card">
          <div class="document-header">
            <span class="document-icon">${getFileIcon(doc.originalFileName)}</span>
            <div class="document-name">
              <h3 title="${doc.originalFileName}">${truncateFileName(doc.originalFileName)}</h3>
            </div>
            <span class="lock-badge">🔒</span>
          </div>
          <div class="document-info">
            <p><strong>Size:</strong> ${formatFileSize(doc.fileSize)}</p>
            <p><strong>Uploaded:</strong> ${new Date(doc.uploadDate).toLocaleDateString()}</p>
          </div>
          <div class="document-actions">
            <button class="action-btn-small" onclick="downloadDocument('${doc._id}', '${doc.originalFileName}')">
              Download
            </button>
            <button class="action-btn-small delete" onclick="deleteDocument('${doc._id}', '${doc.originalFileName}')">
              Delete
            </button>
          </div>
        </div>
      `,
        )
        .join("");
    }
  } catch (error) {
    console.error("Error loading documents:", error);
  }
}

// Download document
async function downloadDocument(docId, fileName) {
  try {
    const response = await fetch(
      `${API_BASE}/api/documents/${docId}/download`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    if (!response.ok) {
      alert("Failed to download document");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Reload download history
    loadDownloadHistory();
    loadStorageStats();
  } catch (error) {
    console.error("Error downloading document:", error);
    alert("Download failed");
  }
}

// Delete document
async function deleteDocument(docId, fileName) {
  if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/documents/${docId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();
    if (data.success) {
      alert("Document deleted successfully");
      loadDocuments();
      loadStorageStats();
    } else {
      alert(data.message || "Failed to delete document");
    }
  } catch (error) {
    console.error("Error deleting document:", error);
    alert("Delete failed");
  }
}

// Load download history
async function loadDownloadHistory() {
  try {
    const response = await fetch(`${API_BASE}/api/documents/history`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();
    if (data.success) {
      const historyList = document.getElementById("historyList");

      if (data.count === 0) {
        historyList.innerHTML = '<p class="empty-state">No downloads yet</p>';
        return;
      }

      historyList.innerHTML = data.history
        .map(
          (item) => `
        <div class="history-item">
          <div class="history-info">
            <h3>${getFileIcon(item.documentId.originalFileName)} ${truncateFileName(item.documentId.originalFileName)}</h3>
            <p>${formatFileSize(item.documentId.fileSize)}</p>
          </div>
          <div class="history-date">
            <p>${new Date(item.downloadDate).toLocaleDateString()}</p>
            <p>${new Date(item.downloadDate).toLocaleTimeString()}</p>
          </div>
        </div>
      `,
        )
        .join("");
    }
  } catch (error) {
    console.error("Error loading download history:", error);
  }
}

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
});

// ==========================================
// Upload Document
// ==========================================

if (document.getElementById("uploadBox")) {
  const uploadBox = document.getElementById("uploadBox");
  const fileInput = document.getElementById("fileInput");
  const uploadProgress = document.getElementById("uploadProgress");
  const progressFill = document.getElementById("progressFill");
  const uploadStatus = document.getElementById("uploadStatus");
  const uploadMessage = document.getElementById("uploadMessage");

  // Click to upload
  uploadBox.addEventListener("click", () => {
    fileInput.click();
  });

  // Drag and drop
  uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = "var(--secondary-color)";
    uploadBox.style.background = "rgba(236, 72, 153, 0.05)";
  });

  uploadBox.addEventListener("dragleave", () => {
    uploadBox.style.borderColor = "var(--primary-color)";
    uploadBox.style.background = "rgba(99, 102, 241, 0.05)";
  });

  uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = "var(--primary-color)";
    uploadBox.style.background = "rgba(99, 102, 241, 0.05)";

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      fileInput.files = files;
      uploadFile();
    }
  });

  // File input change
  fileInput.addEventListener("change", uploadFile);

  // Upload file function
  async function uploadFile() {
    const file = fileInput.files[0];

    if (!file) {
      return;
    }

    // Validate file type
    const allowedExtensions = [
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
    const fileExtension = ("." + file.name.split(".").pop()).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      uploadMessage.textContent =
        "File type not supported. Upload documents, images, videos, audio, archives, or code files.";
      uploadMessage.className = "upload-message error";
      return;
    }

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      uploadMessage.textContent = "File size exceeds 100MB limit";
      uploadMessage.className = "upload-message error";
      return;
    }

    // Show progress bar
    uploadBox.style.display = "none";
    uploadProgress.style.display = "block";
    uploadMessage.className = "";

    const formData = new FormData();
    formData.append("file", file);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          progressFill.style.width = percentComplete + "%";
          uploadStatus.textContent = `Uploading... ${Math.round(percentComplete)}%`;
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            uploadProgress.style.display = "none";
            uploadBox.style.display = "block";
            uploadMessage.textContent = response.message;
            uploadMessage.className = "upload-message success";
            fileInput.value = "";
            progressFill.style.width = "0%";

            // Reset upload box
            setTimeout(() => {
              uploadMessage.className = "";
            }, 3000);

            // Reload documents and storage
            loadDocuments();
            loadStorageStats();
          }
        } else {
          const response = JSON.parse(xhr.responseText);
          uploadProgress.style.display = "none";
          uploadBox.style.display = "block";
          uploadMessage.textContent = response.message || "Upload failed";
          uploadMessage.className = "upload-message error";
          fileInput.value = "";
          progressFill.style.width = "0%";
        }
      });

      xhr.addEventListener("error", () => {
        uploadProgress.style.display = "none";
        uploadBox.style.display = "block";
        uploadMessage.textContent = "Upload failed";
        uploadMessage.className = "upload-message error";
        fileInput.value = "";
        progressFill.style.width = "0%";
      });

      xhr.open("POST", `${API_BASE}/api/documents/upload`);
      xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`);
      xhr.send(formData);
    } catch (error) {
      console.error("Upload error:", error);
      uploadProgress.style.display = "none";
      uploadBox.style.display = "block";
      uploadMessage.textContent = "Upload failed";
      uploadMessage.className = "upload-message error";
      fileInput.value = "";
      progressFill.style.width = "0%";
    }
  }
}

// ==========================================
// Navigation
// ==========================================

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const page = item.getAttribute("data-page");
    switchPage(page);
  });
});

// ==========================================
// Utility Functions
// ==========================================

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function getFileIcon(fileName) {
  const extension = fileName.split(".").pop().toLowerCase();
  const icons = {
    pdf: "📕",
    doc: "📘",
    docx: "📘",
    xls: "📗",
    xlsx: "📗",
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
    gif: "🖼️",
  };
  return icons[extension] || "📄";
}

function truncateFileName(fileName, maxLength = 30) {
  if (fileName.length <= maxLength) return fileName;
  return fileName.substring(0, maxLength - 3) + "...";
}

// ==========================================
// Initialize Dashboard
// ==========================================

if (document.querySelector(".dashboard-container")) {
  window.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    loadUserData();
    loadStorageStats();
    loadDownloadHistory();
  });
}
