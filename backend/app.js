const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser')
const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order');

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// local image fallback (used when Cloudinary keys are not configured)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', order);

// central error handler (validation, multer, bad ObjectId, ...)
app.use((err, req, res, next) => {
    let status = err.statusCode || 500;
    let message = err.message || 'Server error';
    if (err.name === 'ValidationError') {
        status = 400;
        message = Object.values(err.errors).map(e => e.message).join(', ');
    } else if (err.name === 'CastError') {
        status = 404;
        message = 'Resource not found';
    } else if (err.name === 'MulterError' || /Unsupported file type/.test(message)) {
        status = 400;
    }
    if (status === 500) console.error(err);
    res.status(status).json({ success: false, message });
});

module.exports = app
