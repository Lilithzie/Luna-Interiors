const fs = require('fs/promises');
const path = require('path');
const { requireCloudinary } = require('../config/cloudinary');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const removeTempFile = async (file) => {
    if (!file || !file.path) return;
    try {
        await fs.unlink(file.path);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.warn('Unable to remove temporary upload:', error.code);
        }
    }
};

const uploadError = (error) => {
    if (error.code === 'CLOUDINARY_NOT_CONFIGURED') return error;

    const wrapped = new Error('Image upload failed. Check the Cloudinary configuration and try again.');
    wrapped.statusCode = 502;
    wrapped.code = 'IMAGE_UPLOAD_FAILED';
    console.error('Cloudinary upload failed:', {
        name: error.name,
        code: error.http_code || error.code,
    });
    return wrapped;
};

exports.uploadImages = async (files = [], req, folder = 'products') => {
    if (!Array.isArray(files) || files.length === 0) return [];

    const uploaded = [];

    try {
        const cloudinary = requireCloudinary();
        for (const file of files) {
            try {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder,
                    width: 800,
                    crop: 'scale',
            });
                uploaded.push({ public_id: result.public_id, url: result.secure_url });
            } finally {
                await removeTempFile(file);
            }
        }
        return uploaded;
    } catch (error) {
        await Promise.all(files.map(removeTempFile));
        await exports.destroyImages(uploaded);
        throw uploadError(error);
    }
};

exports.destroyImages = async (images = []) => {
    if (!Array.isArray(images) || images.length === 0) return;

    for (const image of images) {
        if (!image || !image.public_id) continue;
        try {
            if (image.public_id.startsWith('local:')) {
                await fs.unlink(path.join(UPLOAD_DIR, image.public_id.slice('local:'.length)));
                continue;
            }
            const cloudinary = requireCloudinary();
            await cloudinary.uploader.destroy(image.public_id);
        } catch (error) {
            console.error('Cloudinary image cleanup failed:', {
                publicId: image.public_id,
                code: error.http_code || error.code,
            });
        }
    }
};
