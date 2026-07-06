import {Request, Response, NextFunction} from 'express';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    const error = err instanceof Error ? err : new Error(String(err));
    res.status(statusCode).json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
};