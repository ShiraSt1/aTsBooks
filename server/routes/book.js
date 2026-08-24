const express=require("express")
const bookController=require("../Controllers/bookController")
const router=express.Router()
const verifyJWT=require("../middleware/verifyJWT")
const admirMiddleware=require("../middleware/admirMiddleware")

const upload = require('../middleware/s3Upload'); 

router.post('/', verifyJWT ,admirMiddleware, bookController.createNewBook);
router.get('/',bookController.getAllBooks)
router.get('/:id',verifyJWT,bookController.getBookById)
router.put('/', verifyJWT, admirMiddleware, upload.single('image'),bookController.updateBook);
router.delete('/:id',verifyJWT ,admirMiddleware,bookController.deleteBook)
router.get('/grade/:Id',bookController.getBooksForGrade)

module.exports=router