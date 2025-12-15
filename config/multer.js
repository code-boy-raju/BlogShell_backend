// multer setup
const multer = require('multer');
const path = require('path');

// Configure storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
    // ✅ The trailing slash ensures clarity that "uploads" is a folder.
  },
  filename: function (req, file, cb) {
    // Optional: prepend timestamp to avoid overwriting files with same name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// Accept any file type
const uploadFile = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    cb(null, true); // ✅ Accept all file types
  },
  limits: { fileSize: 10 * 1024 * 1024 } // ✅ Max 100 MB
});

module.exports = { uploadFile };

