const express = require("express");
const router = express.Router();
const fileController = require("../Controllers/fileController");
const verifyJWT=require("../middleware/verifyJWT")
const admirMiddleware=require("../middleware/admirMiddleware")
const upload = require("../middleware/upload"); // <-- להוסיף את זה!

router.post("/",verifyJWT ,admirMiddleware,upload.single("file"), fileController.uploadFile);
router.get("/", verifyJWT,fileController.getAllFiles);
router.get("/title/:titleId",verifyJWT, fileController.getFilesByTitle);
router.get("/download/:fileId", fileController.downloadFile);
router.delete("/:fileId",verifyJWT ,admirMiddleware,fileController.deleteFile);
router.put("/:fileId", upload.single("file"), fileController.updateFile);
router.get('/view/:fileId',verifyJWT, fileController.viewFileContent);

router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        res.status(400).send({ message: "Error uploading file", error: err.message });
    } else if (err) {
        res.status(500).send({ message: "Server error", error: err.message });
    } else {
        next();
    }
});

module.exports = router;