require("dotenv").config()
const express = require("express")
const cors = require("cors")
const nodemailer = require('nodemailer');
const corsOptions = require("./config/corsOptions")
const connectDB = require("./config/dbConn.js")
const mongoose = require("mongoose")
const rateLimit = require('express-rate-limit');

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // או כל תיקיה אחרת
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });


const app = express()
const PORT = process.env.PORT || 3001
const path = require('path');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 דקות
  max: 100, // 100 בקשות לחלון זמן
message: {
    status: 429,
    error: 'Too many requests, please try again later.',
    description: 'You have exceeded the number of allowed requests. Please wait before trying again.'
  },
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors(corsOptions))
app.options('*', cors(corsOptions)); // פתרון לבקשות preflight
app.use(express.json())
app.use(express.static("public",{maxAge: '1h'}))
app.use(express.static(path.join(__dirname, 'public')));

app.use(limiter);

app.use(express.urlencoded({ extended: true })); 
app.use("/api/user", require("./routes/user.js"))
app.use("/api/book", require("./routes/book.js"))
app.use("/api/grade", require("./routes/grade.js"))
app.use("/api/title", require("./routes/title.js"))
app.use("/api/file", require("./routes/file.js"))
app.use("/api/course", require("./routes/course.js"))
app.use('/api', require("./routes/download.js"));

const startServer = async () => {
  try {
    await connectDB(); // מחכה לחיבור למסד הנתונים
    console.log("Connected to MongoDB");

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1); // מסיים את התהליך אם משהו נכשל
  }
};

startServer();