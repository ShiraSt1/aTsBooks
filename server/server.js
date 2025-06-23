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
  windowMs: 1 * 60 * 1000, // 15 דקות
  max: 100, // 100 בקשות לחלון זמן
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors(corsOptions))
app.options('*', cors(corsOptions)); // פתרון לבקשות preflight
app.use(express.json())
app.use(express.static("public"))
app.use(express.static(path.join(__dirname, 'public')));

app.use(limiter);

app.get('/api/sitemap', (req, res) => {
  res.type('application/xml');
  res.send(`
    <?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<!-- created with Free Online Sitemap Generator www.xml-sitemaps.com -->
<url>
  <loc>https://atsbooks-h4jx.onrender.com/</loc>
  <lastmod>2025-06-23T19:59:11+00:00</lastmod>
</url>
</urlset>
  `);
});

app.get('/googleea171b815b7e0bf10.html', (req, res) => {
  res.sendFile(path.resolve('public/googleea171b815b7e0bf10.html'));
});

app.get('/text.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'text.html'));
});


app.use("/api/user", require("./routes/user.js"))
app.use("/api/book", require("./routes/book.js"))
app.use("/api/grade", require("./routes/grade.js"))
app.use("/api/title", require("./routes/title.js"))
app.use("/api/file", require("./routes/file.js"))
app.use("/api/course", require("./routes/course.js"))

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});


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