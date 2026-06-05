const express = require('express');
const { uploadDocument } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, upload.single('document'), uploadDocument);

module.exports = router;
