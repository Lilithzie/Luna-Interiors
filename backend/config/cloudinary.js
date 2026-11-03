const path = require('path');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;

// Vercel supplies process.env directly. Load the file only outside production.
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.resolve(__dirname, '.env') });
}

const getCredentials = () => ({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const hasCredentials = () => {
    const credentials = getCredentials();
    return Object.values(credentials).every(value => typeof value === 'string' && value.trim());
};

const credentials = getCredentials();
cloudinary.config(credentials);

console.info('Cloudinary configuration detected:', {
    cloudName: Boolean(credentials.cloud_name),
    apiKey: Boolean(credentials.api_key),
    apiSecret: Boolean(credentials.api_secret),
});

const requireCloudinary = () => {
    if (!hasCredentials()) {
        const error = new Error(
            'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on the backend.'
        );
        error.statusCode = 503;
        error.code = 'CLOUDINARY_NOT_CONFIGURED';
        throw error;
    }
    return cloudinary;
};

module.exports = { cloudinary, hasCredentials, requireCloudinary };
