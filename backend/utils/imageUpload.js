const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Cloudinary is the primary storage. When the CLOUDINARY_* variables are not
// filled in (e.g. first run on a classmate's laptop) images fall back to the
// local /uploads folder so the system still works.
const useCloudinary = () =>
    !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

exports.uploadImages = async (files = [], req, folder = 'products') => {
    const results = [];
    for (const file of files) {
        if (useCloudinary()) {
            const r = await cloudinary.uploader.upload(file.path, { folder, width: 800, crop: 'scale' });
            results.push({ public_id: r.public_id, url: r.secure_url });
        } else {
            const dir = path.join(UPLOAD_DIR, folder);
            fs.mkdirSync(dir, { recursive: true });
            const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`;
            fs.copyFileSync(file.path, path.join(dir, name));
            results.push({
                public_id: `local:${folder}/${name}`,
                url: `${req.protocol}://${req.get('host')}/uploads/${folder}/${name}`
            });
        }
        fs.unlink(file.path, () => { });
    }
    return results;
};

exports.destroyImages = async (images = []) => {
    for (const img of images) {
        try {
            if (img.public_id && img.public_id.startsWith('local:')) {
                const rel = img.public_id.slice('local:'.length);
                fs.unlink(path.join(UPLOAD_DIR, rel), () => { });
            } else if (img.public_id && useCloudinary()) {
                await cloudinary.uploader.destroy(img.public_id);
            }
        } catch (e) {
            console.log('Image cleanup failed:', e.message);
        }
    }
};
