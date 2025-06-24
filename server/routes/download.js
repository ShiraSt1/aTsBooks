const express = require('express');
const router = express.Router();
// const { downloadTitleAsZip } = require('../Controllers/downloadController.js');
const downloadController = require("../Controllers/downloadController")

router.get('/download-zip/:titleId', downloadController.downloadTitleAsZip);
module.exports = router;
