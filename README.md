# Smart Digital Locker System

A secure, production-ready cloud-based document storage system with AES-256 encryption, JWT authentication, and modern UI.

**Project Type:** Final Year B.Sc Computer Science Project

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Sample Test Data](#sample-test-data)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Core Features

1. **User Authentication System**
   - User registration with validation
   - Secure login with JWT tokens
   - Password hashing using bcrypt
   - Protected dashboard access
   - Logout functionality

2. **Digital Locker Dashboard**
   - User profile information display
   - Real-time storage usage tracking
   - File count statistics
   - Responsive sidebar navigation
   - Quick action buttons

3. **Document Upload Module**
   - Drag-and-drop file upload
   - AES-256 file encryption before storage
   - File type validation (Documents, Images, Video, Audio, Archives, Code)
   - File size validation (100MB per file)
   - Total storage limit enforcement (1GB per user)
   - Upload progress tracking

4. **Document Management**
   - View all uploaded documents
   - Download decrypted documents
   - Delete documents with confirmation
   - Lock badge for visual security confirmation
   - File metadata display (name, size, upload date)

5. **Download History Tracking**
   - Complete download history log
   - Document information in history
   - Download timestamp recording
   - History pagination support

6. **Storage Monitoring**
   - Real-time storage usage calculation
   - Visual storage bar with percentage
   - Warning when storage >80% full
   - Error state when storage >95% full
   - Prevents uploads when limit exceeded

7. **Security Features**
   - AES-256 bit encryption for all files
   - JWT token-based authentication
   - bcrypt password hashing (10 salt rounds)
   - Protected API routes
   - User-specific access control
   - CORS protection
   - Input validation on all endpoints

## 🛠 Tech Stack

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **Vanilla JavaScript** - No frameworks, pure JS functionality

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB

### Authentication & Security

- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing library
- **crypto** - Node.js built-in encryption module

### File Handling

- **Multer** - File upload middleware

## 📦 Requirements

### System Requirements

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- MongoDB (v4.0 or higher) - Local or Cloud

### Browser Requirements

- Modern browser with ES6 support
- JavaScript enabled
- Local storage enabled

## 🚀 Installation

### Step 1: Clone or Extract Project

```bash
cd /home/kuggazees/Desktop/digloker
```

### Step 2: Install Backend Dependencies

```bash
npm install
```

This will install:

- express
- mongoose
- jsonwebtoken
- bcrypt
- multer
- cors
- dotenv

### Step 3: Install MongoDB

#### Option A: Local MongoDB (Linux/Mac)

```bash
# Using Homebrew (macOS)
brew install mongodb-community
brew services start mongodb-community

# Using apt (Ubuntu/Debian)
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

#### Option B: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get the connection string
5. Use the connection string in `.env`

### Step 4: Create Environment Configuration

```bash
# Copy example .env file
cp .env.example .env

# Generate encryption key
openssl rand -hex 32
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-digital-locker
JWT_SECRET=your_secret_key_here
ENCRYPTION_KEY=your_32_byte_hex_key_here
```

## ⚙️ Configuration

### MongoDB Connection

**Local MongoDB:**

```env
MONGODB_URI=mongodb://localhost:27017/smart-digital-locker
```

**MongoDB Atlas (Cloud):**

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-digital-locker?retryWrites=true&w=majority
```

### JWT Configuration

Generate a strong secret key:

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (using Node)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update in `.env`:

```env
JWT_SECRET=your_generated_key_here
JWT_EXPIRE=7d
```

### Encryption Key

Generate a 256-bit encryption key (64 hex characters):

```bash
# Linux/Mac
openssl rand -hex 32

# Windows (using Node)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update in `.env`:

```env
ENCRYPTION_KEY=your_generated_key_here
```

## ▶️ Running the Application

### Development Mode (with auto-reload)

Prerequisites: Install nodemon globally

```bash
npm install -g nodemon
```

Then run:

```bash
npm run dev
```

The application will be available at: `http://localhost:5000`

### Production Mode

```bash
npm start
```

The application will be available at: `http://localhost:5000`

### Verify Installation

1. **Check Backend is Running:**
   - Open browser and go to `http://localhost:5000`
   - You should see the landing page

2. **Check MongoDB Connection:**
   - Open terminal and check for any connection errors
   - In development, you'll see: "Connected to MongoDB"

3. **Test Registration:**
   - Click "Register" on landing page
   - Fill in test credentials
   - You should be redirected to dashboard

## 🔌 API Endpoints

### Authentication Endpoints

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-03-03T10:00:00Z"
  }
}
```

### Document Endpoints

```
POST /api/documents/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Files: [file]

Response:
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "_id": "...",
    "userId": "...",
    "originalFileName": "example.pdf",
    "encryptedFilePath": "1234567890_...",
    "fileSize": 102400,
    "uploadDate": "2026-03-03T10:00:00Z"
  }
}
```

```
GET /api/documents
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 2,
  "totalStorageUsed": 204800,
  "storageLimit": 104857600,
  "documents": [...]
}
```

```
GET /api/documents/:id/download
Authorization: Bearer <token>

Response: [File Binary Data]
```

```
DELETE /api/documents/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Document deleted successfully"
}
```

```
GET /api/documents/stats/storage
Authorization: Bearer <token>

Response:
{
  "success": true,
  "totalStorageUsed": 204800,
  "storageLimit": 104857600,
  "remainingStorage": 104652800,
  "fileCount": 2
}
```

```
GET /api/documents/history
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 5,
  "history": [...]
}
```

## 📝 Sample Test Data

### Test User 1

```
Email: john@example.com
Password: password123
Name: John Doe
```

### Test User 2

```
Email: jane@example.com
Password: password456
Name: Jane Smith
```

### Register the First User

1. Go to `http://localhost:5000`
2. Click "Register"
3. Enter:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Create Account"
5. You'll be redirected to dashboard

### Upload Test Documents

Create test files:

```bash
# Create a test PDF (text file with .pdf extension)
echo "This is a test document" > test_document.pdf

# Create a test text file
echo "Test content" > test.txt
```

Upload via dashboard:

1. Click "Upload" in sidebar
2. Drag and drop or click to select `test_document.pdf`
3. Watch the progress bar
4. Document will appear in "Documents" section

## 📁 Project Structure

```
/digital-locker
├── /client                    # Frontend files
│   ├── index.html            # Landing page
│   ├── login.html            # Login page
│   ├── register.html         # Registration page
│   ├── dashboard.html        # Main dashboard
│   ├── styles.css            # All styling
│   └── script.js             # Frontend logic
│
├── /server                   # Backend files
│   ├── /models              # Database models
│   │   ├── User.js
│   │   ├── Document.js
│   │   └── DownloadHistory.js
│   │
│   ├── /controllers         # Route controllers
│   │   ├── authController.js
│   │   └── documentController.js
│   │
│   ├── /routes              # API routes
│   │   ├── authRoutes.js
│   │   └── documentRoutes.js
│   │
│   ├── /middleware          # Express middleware
│   │   └── authMiddleware.js
│   │
│   ├── /utils               # Utility functions
│   │   ├── encryption.js
│   │   └── jwt.js
│   │
│   ├── /uploads             # Encrypted file storage
│   │
│   └── server.js            # Express server entry point
│
├── package.json             # Node.js dependencies
├── .env.example             # Environment variables example
└── README.md               # This file
```

## 🔒 Security Features

### Password Security

- **bcrypt hashing** with 10 salt rounds
- Passwords never stored in plain text
- Passwords selected only when needed

### File Encryption

- **AES-256-CBC encryption** for all uploaded files
- Random IV (Initialization Vector) per file
- Decryption only on authorized download
- Encrypted files stored with unsearchable names

### Authentication

- **JWT tokens** with configurable expiration
- Tokens stored in browser localStorage
- Token required for all protected routes
- Token validated on every request

### Database

- Mongoose schema validation
- User input sanitization
- Unique email addresses
- Foreign key relationships

### API Security

- **CORS protection** enabled
- No sensitive data in error messages
- Rate limiting recommended for production
- Input validation on all endpoints

### User Access

- Users can only access their own documents
- Document ownership verified before operations
- Download history linked to user
- Storage limits per user

## 🐛 Troubleshooting

### Issue: MongoDB Connection Error

**Solution:**

```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Start MongoDB if stopped
sudo systemctl start mongodb

# Or use MongoDB Atlas - update MONGODB_URI in .env
```

### Issue: Port 5000 Already in Use

**Solution:**

```bash
# Kill process on port 5000 (Linux/Mac)
lsof -i :5000
kill -9 <PID>

# Or use different port
PORT=3000 npm start
```

### Issue: Encryption Key Error

**Solution:**

```bash
# Generate proper encryption key
openssl rand -hex 32

# Update .env with new key
ENCRYPTION_KEY=your_new_key
```

### Issue: Files Won't Upload

**Solution:**

- Check file type (Documents, Images, Video, Audio, Archives, Code files supported)
- Check file size (max 100MB per file)
- Check total storage (max 1GB per user)
- Check `/server/uploads` folder exists and is writable

### Issue: Can't Login After Registration

**Solution:**

- Clear browser cookies/cache
- Clear localStorage: Open DevTools → Application → Clear Storage
- Check browser console for error messages
- Verify MongoDB has the user record

### Issue: Dashboard Blank/Not Loading

**Solution:**

- Check browser console for errors (F12)
- Verify token is saved: `localStorage.getItem('token')` in console
- Check backend is running and accessible
- Verify CORS is enabled

## 📊 Database Schemas

### User Schema

```javascript
{
  _id: ObjectId,
  name: String (required, min: 2),
  email: String (required, unique),
  password: String (hashed, required, min: 6),
  createdAt: Date (default: now)
}
```

### Document Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  originalFileName: String (required),
  encryptedFilePath: String (required),
  fileSize: Number (required),
  uploadDate: Date (default: now)
}
```

### DownloadHistory Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User, required),
  documentId: ObjectId (reference to Document, required),
  downloadDate: Date (default: now)
}
```

## 🎓 Educational Value

This project demonstrates:

1. **Full-Stack Web Development**
   - Frontend: HTML, CSS, JavaScript
   - Backend: Node.js, Express
   - Database: MongoDB, Mongoose

2. **Security Implementation**
   - Encryption/Decryption
   - Authentication & Authorization
   - Password Hashing
   - JWT Tokens

3. **Software Engineering Principles**
   - MVC Architecture
   - Middleware Pattern
   - RESTful API Design
   - Error Handling
   - Code Organization

4. **Database Design**
   - Schema Design
   - Relationships
   - Indexing
   - Data Validation

## 📄 License

This project is created for educational purposes as part of a Final Year B.Sc Computer Science Project.

## 👨‍💻 Author

Created as a comprehensive example of a production-ready web application with security, authentication, and file encryption.

## 🤝 Support

For issues or questions, refer to the Troubleshooting section or check the console for error messages.

---

**Happy Coding! 🚀**
# vicky
