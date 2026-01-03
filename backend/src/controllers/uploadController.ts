import {Request, Response} from 'express';

// @desc    Загрузить изображение
// @route   POST /api/upload
// @access  Private/Admin
export const uploadImage = (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Файл не был загружен');
    }

    res.status(200).send({
        message: 'Изображение загружено',
        image: `/${req.file.path.replace(/\\/g, '/')}`,
    });
};