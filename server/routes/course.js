const express = require("express")
const router = express.Router()
const courseController = require("../Controllers/courseController")

router.post('/register',courseController.registerToCourse)

module.exports = router