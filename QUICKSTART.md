# Quick Start Guide - Smart Digital Locker System

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies (2 minutes)

```bash
cd /home/kuggazees/Desktop/digloker
npm install
```

### Step 2: Set Up Environment (1 minute)

```bash
# Copy the example file
cp .env.example .env
```

**Edit `.env` file with these values:**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-digital-locker
JWT_SECRET=your_secret_key_12345_change_in_production
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### Step 3: Start MongoDB (1 minute)

**Linux/Mac:**

```bash
# If using Homebrew on Mac
brew services start mongodb-community

# If using system MongoDB on Linux
sudo systemctl start mongodb
```

**Using Docker (Any OS):**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 4: Start the Application (1 minute)

```bash
npm start
```

You should see:

```
Connected to MongoDB
Server running on port 5000
Visit http://localhost:5000 to access the application
```

## ✅ Verify Installation

1. **Open Browser:** http://localhost:5000
   - Should see landing page with "Get Started" button

2. **Test Registration:**
   - Click "Register"
   - Enter test details:
     - Name: Test User
     - Email: test@example.com
     - Password: test123
   - Should redirect to dashboard

3. **Test Upload:**
   - On dashboard, click "Upload"
   - Create test file or drag any PDF/image
   - Should show upload progress bar

## 🔧 Quick Troubleshooting

| Problem                | Solution                                                               |
| ---------------------- | ---------------------------------------------------------------------- |
| MongoDB not connecting | Check `.env` MONGODB_URI, ensure MongoDB is running                    |
| Port 5000 in use       | Use different port: `PORT=3000 npm start`                              |
| Can't login            | Clear browser localStorage with DevTools                               |
| Files won't upload     | Check format (Documents, Images, Video, Audio, Code) and size (<100MB) |
| Blank dashboard        | Check browser console (F12) for errors                                 |

## 📁 Folder Structure Quick Reference

```
digloker/
├── client/           ← Frontend (HTML, CSS, JS)
├── server/          ← Backend (Node.js, Express)
│   ├── models/      ← Database schemas
│   ├── routes/      ← API endpoints
│   ├── controllers/ ← Business logic
│   ├── middleware/  ← Auth & protection
│   ├── utils/       ← Helpers (encryption, JWT)
│   └── uploads/     ← Encrypted files storage
├── package.json     ← Dependencies
├── .env.example     ← Config template
└── README.md        ← Full documentation
```

## 🚀 Ready to Run!

```bash
# Install
npm install

# Configure (copy .env.example to .env)
cp .env.example .env

# Start MongoDB (if using local)
# brew services start mongodb-community (Mac)
# or docker run -d -p 27017:27017 mongo (Any OS)

# Run
npm start

# Open browser
# http://localhost:5000
```

## 📚 Next Steps

- Read [README.md](./README.md) for complete documentation
- Review [API Endpoints](./README.md#-api-endpoints)
- Check [Project Structure](./README.md#-project-structure)
- Test all features in dashboard

## 💡 Tips

- Use **dev mode** for development: `npm run dev` (requires `npm install -g nodemon`)
- Data persists in MongoDB - restart server to keep uploads
- Encryption key determines file security - keep it safe!
- Test user data: email `test@example.com`, password `test123`

---

**Questions? Check the full README.md file for detailed documentation.**
