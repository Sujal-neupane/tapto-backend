import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { HttpError } from "../errors/http-error";
// Ensure the uploads directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const userUploadDir = path.join(uploadDir, 'users');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(userUploadDir)) {
    fs.mkdirSync(userUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4();
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/heic',
        'image/heif',
        'image/jpg',
        'image/pjpeg',
        'image/tiff',
        'image/bmp',
        'image/x-ms-bmp',
        'image/x-bmp',
        'application/octet-stream',
        'image/*',
    ];
    const extension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.webp',
        '.heic',
        '.heif',
        '.tiff',
        '.tif',
        '.bmp',
    ];
    
    const isMimetypeAllowed = allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/');
    const isExtensionAllowed = allowedExtensions.includes(extension);
    
    console.log('📁 File Filter Check:', {
        originalname: file.originalname,
        extension,
        mimetype: file.mimetype,
        isMimetypeAllowed,
        isExtensionAllowed
    });
    
    // Accept if either mimetype OR extension matches
    if (isMimetypeAllowed || isExtensionAllowed) {
        console.log('✅ File accepted');
        cb(null, true);
    } else {
        console.error('❌ File rejected:', { mimetype: file.mimetype, extension });
        cb(new HttpError(400, `Invalid file type. Mimetype: ${file.mimetype}, Extension: ${extension}`));
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

const userStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, userUploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4();
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

export const uploadUserImage = multer({
    storage: userStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploads = {
    single: (fieldName: string) => upload.single(fieldName),
    array: (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => upload.fields(fieldsArray)
};

export const uploadsUser = {
    single: (fieldName: string) => uploadUserImage.single(fieldName),
    array: (fieldName: string, maxCount: number) => uploadUserImage.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => uploadUserImage.fields(fieldsArray)
};