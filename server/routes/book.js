const express=require("express")
const router=express.Router()
const bookController=require("../Controllers/bookController")
const verifyJWT=require("../middleware/verifyJWT")
const admirMiddleware=require("../middleware/admirMiddleware")

// const path = require('path');
// const multer = require('multer');
// const fs = require('fs');

// Configure multer storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/bookImages');
//     },
//     filename: (req, file, cb) => {
//         const ext = path.extname(file.originalname);
//         const baseName = req.body.name ? req.body.name.replace(/\s+/g, '_') : 'file';
//         const uniqueName = baseName + '-' + Date.now() + ext;
//         cb(null, uniqueName);
//     }
// });
//  const upload = multer({ storage });

const upload = require('../middleware/s3Upload'); 

router.post('/', verifyJWT ,admirMiddleware,upload.single('image'), bookController.createNewBook);
router.get('/',bookController.getAllBooks)
router.get('/:id',verifyJWT,bookController.getBookById)
router.put('/', verifyJWT, admirMiddleware, upload.single('image'),bookController.updateBook);
router.delete('/:id',verifyJWT ,admirMiddleware,bookController.deleteBook)
router.get('/grade/:Id',bookController.getBooksForGrade)

// router.post('/',bookController.createNewBook)

module.exports=router