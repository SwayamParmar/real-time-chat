const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Extract public_id from Cloudinary URL
const getPublicId = (url) => {
    // URL format: https://res.cloudinary.com/cloud/image/upload/v123/chatapp/filename.jpg
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    // everything after upload/v{version}/ is the public_id
    const withVersion = parts.slice(uploadIndex + 1).join('/');
    // remove version segment (v1234567)
    const withoutVersion = withVersion.replace(/^v\d+\//, '');
    // remove file extension
    return withoutVersion.replace(/\.[^/.]+$/, '');
};

const deleteFromCloudinary = async (url, resourceType = 'image') => {
    try {
        const publicId = getPublicId(url);
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
        console.log(`🗑️ Cloudinary delete: ${publicId} →`, result.result);
        return result;
    } catch (err) {
        console.error('Cloudinary delete error:', err);
    }
};

module.exports = { cloudinary, deleteFromCloudinary };