import path from 'path';
import express, { Request } from 'express';
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

function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
    const filetypes = /jpe?g|png|webp/;
    const mimetypes = /image\/jpe?g|image\/png|image\/webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = mimetypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Можно загружать только изображения!'));
    }
}

const upload = multer({storage, fileFilter});

// multer errors (bad file type, size limit) arrive via the callback, not a
// thrown error — left to the default error middleware they'd all report as a
// generic 500 since res.statusCode is still 200 at that point. Intercepting
// here lets a bad upload report as the 400 it actually is.
function handleUpload(req: Request, res: express.Response, next: express.NextFunction) {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}

router.post('/', protect, admin, handleUpload, uploadImage);

export default router;