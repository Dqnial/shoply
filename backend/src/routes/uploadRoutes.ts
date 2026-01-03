import path from 'path';
import express from 'express';
import multer, {FileFilterCallback} from 'multer';
import {uploadImage} from '../controllers/uploadController.js';
import {protect, admin} from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

function fileFilter(req: any, file: Express.Multer.File, cb: FileFilterCallback) {
    const filetypes = /jpe?g|png|webp/;
    const mimetypes = /image\/jpe?g|image\/png|image\/webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = mimetypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Можно загружать только изображения!') as any, false);
    }
}

const upload = multer({storage, fileFilter});

router.post('/', protect, admin, upload.single('image'), uploadImage);

export default router;