const express = require('express');
const router = express.Router();

const { imageUpload, resumeUpload } = require('../config/cloudinary');
const { uploadImage, uploadResume } = require('../controllers/upload.controller');
const { uploadLimiter } = require('../middleware/rateLimit');

router.post('/image',  uploadLimiter, imageUpload.single('image'),   uploadImage);
router.post('/resume', uploadLimiter, resumeUpload.single('resume'), uploadResume);

module.exports = router;
