const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp'); // תיקייה זמנית
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
 });

module.exports = upload;