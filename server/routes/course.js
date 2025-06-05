const express = require("express")
const router = express.Router()
const courseController = require("../Controllers/courseController")
const upload = require("../middleware/upload"); 
const multer = require("multer");

router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        res.status(400).send({ message: "Error uploading file", error: err.message });
    } else if (err) {
        res.status(500).send({ message: "Server error", error: err.message });
    } else {
        next();
    }
});

router.post('/register',upload.array("files"),courseController.registerToCourse)
router.post('/newsLetter',upload.array("files"),courseController.newsLetter)

module.exports = router