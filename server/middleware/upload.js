// const multer = require("multer");

// // הגדרת Storage עבור multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");  // הנתיב שבו הקבצים יישמרו
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname); // שם הקובץ
//   }
// });

// // הגדרת ה־upload
// const upload = multer({ storage: storage });

// module.exports = upload;

const multer = require("multer");
const storage = multer.memoryStorage(); // <--- רק זה
const upload = multer({ storage: storage });
module.exports = upload;