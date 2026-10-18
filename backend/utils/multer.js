const multer = require("multer");
const path = require("path");

module.exports = multer({
    limits: { fieldSize: 100 * 1024 * 1024, fileSize: 5 * 1024 * 1024, files: 10 },
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
            return cb(new Error("Unsupported file type! Only JPG, PNG and WEBP images are allowed."), false);
        }
        cb(null, true);
    },
});
