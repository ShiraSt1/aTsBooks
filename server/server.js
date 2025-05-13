require("dotenv").config()
const express = require("express")
const cors = require("cors")
const nodemailer = require('nodemailer');
const corsOptions = require("./config/corsOptions")
const connectDB = require("./config/dbConn.js")
const { default: mongoose } = require("mongoose")

const multer = require("multer");
const storage = multer.memoryStorage();

const app = express()
const PORT = process.env.PORT || 4000
const upload = multer({ storage });
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB()

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.static("public"))

app.use("/api/user", require("./routes/user.js"))
app.use("/api/book", require("./routes/book.js"))
app.use("/api/grade", require("./routes/grade.js"))
app.use("/api/title", require("./routes/title.js"))
app.use("/api/file", require("./routes/file.js"))
app.use("/api/course", require("./routes/course.js"))

app.get('/', (req, res) => { res.send("this is the home page") })

mongoose.connection.once("open", () => {
  console.log("success")
  app.listen(PORT, () => { console.log(`server runing on port ${PORT}`) })
})
mongoose.connection.on("error", (err) => { console.log(err) })
