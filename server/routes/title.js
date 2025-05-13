
const express=require("express")
const router=express.Router()
const titleController=require("../Controllers/titleController")
const verifyJWT=require("../middleware/verifyJWT")
const admirMiddleware=require("../middleware/admirMiddleware")

router.post('/',verifyJWT,admirMiddleware,titleController.createNewTitle)
router.get('/:id',verifyJWT,titleController.getTitleById)
router.get('/getTitlesByBook/:id',verifyJWT,titleController.getTitlesByBook)
router.delete('/:id',verifyJWT,admirMiddleware,titleController.deleteTitle)

module.exports=router