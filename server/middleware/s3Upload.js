const multer = require("multer");

// שימוש בזיכרון – ולא בדיסק
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;