const { Readable } = require('stream');
const { cloudinary } = require('../config/cloudinary');

/**
 * Streams a buffer directly to Cloudinary.
 * No temp files, works great on Render's ephemeral filesystem.
 */
const streamToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    Readable.from(buffer).pipe(uploadStream);
  });

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const result = await streamToCloudinary(req.file.buffer, {
      folder: 'portfolio-share/images',
      transformation: [
        { width: 1200, height: 900, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
      ],
    });

    res.json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    next(err);
  }
};

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No resume file provided' });
    }

    const result = await streamToCloudinary(req.file.buffer, {
      folder: 'portfolio-share/resumes',
      resource_type: 'raw',
      format: 'pdf',
    });

    res.json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadImage, uploadResume };
