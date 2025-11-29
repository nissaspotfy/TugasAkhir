const multer = require('multer');
const path = require('path');
const fs = require('fs');

const directories = {
    profilePicture: path.join(__dirname, '../../public/uploads/profilePicture'),
}

Object.values(directories).forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const fileTypes = {
    images: ['image/jpeg', 'image/png', 'image/jpg'],
    videos: ['video/mp4', 'video/mkv', 'video/avi'],
    media : ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/mkv', 'video/avi'],
}


const uploadConfig = (directory, type, maxSize) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, directory);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    });

    return multer({
        storage,
        limits: { fileSize: maxSize },
        fileFilter: (req, file, cb) => {
            if (fileTypes[type].includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error(`Invalid file type. Only ${type} files are allowed.`), false);
            }
        }
    });
}

const uploadProfilePicture = uploadConfig(directories.profilePicture, 'images', 5 * 1024 * 1024); // 5 MB

module.exports = {
    uploadProfilePicture,
};