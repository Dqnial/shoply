import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Генерация токена и установка куки
const generateToken = (res, userId) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '30d'});

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // HTTPS в продакшене
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    });
};

export const registerUser = async (req, res) => {
    const {name, email, password} = req.body;
    const userExists = await User.findOne({email});

    if (userExists) return res.status(400).json({message: 'Пользователь уже существует'});

    const user = await User.create({name, email, password}); // Пароль хешируется в модели (см. ниже)

    if (user) {
        generateToken(res, user._id);
        res.status(201).json({_id: user._id, name: user.name, email: user.email});
    }
};

export const authUser = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});

    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id);
        res.json({_id: user._id, name: user.name, email: user.email});
    } else {
        res.status(401).json({message: 'Неверный email или пароль'});
    }
};

export const logoutUser = (req, res) => {
    res.cookie('jwt', '', {httpOnly: true, expires: new Date(0)});
    res.status(200).json({message: 'Вышли из системы'});
};