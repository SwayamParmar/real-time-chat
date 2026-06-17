const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Use memory storage — no local files saved
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
    fileFilter: (req, file, cb) => {
        const allowed = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/quicktime',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'));
        }
    }
});

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file provided' });

        // ✅ Determine folder + resource type
        const isVideo = req.file.mimetype.startsWith('video/');
        const isImage = req.file.mimetype.startsWith('image/');
        const resourceType = isVideo ? 'video' : isImage ? 'image' : 'raw';

        // ✅ Upload buffer directly to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'chatapp',
                    resource_type: resourceType,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        res.status(200).json({
            url: result.secure_url,
            name: req.file.originalname,
            size: req.file.size,
            type: resourceType,
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
};

router.post('/', authMiddleware, upload.single('file'), exports.uploadFile);

module.exports = router;