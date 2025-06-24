const express = require('express');
const router = express.Router();
const { downloadTitleAsZip } = require('../controllers/downloadController');
router.get('/download-zip/:titleId', downloadTitleAsZip);
module.exports = router;
