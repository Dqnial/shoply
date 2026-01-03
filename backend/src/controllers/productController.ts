import {Request, Response} from 'express';
import Product from '../models/Product.js';
import {AuthRequest} from '../middleware/authMiddleware.js';

// @desc    Получить все товары
// @route   GET /api/products
export const getProducts = async (req: Request, res: Response) => {
    const products = await Product.find({});
    res.json(products);
};

// @desc    Получить один товар по ID
// @route   GET /api/products/:id
export const getProductById = async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Товар не найден');
    }
};

// @desc    Удалить товар
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({message: 'Товар удален'});
    } else {
        res.status(404);
        throw new Error('Товар не найден');
    }
};

// @desc    Создать товар
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: AuthRequest, res: Response) => {
    // Создаем "болванку" товара, которую админ потом отредактирует
    const product = new Product({
        name: 'Новый товар',
        price: 0,
        user: req.user?._id, // Привязка к админу
        image: '/images/sample.jpg',
        brand: 'Бренд',
        category: 'Категория',
        countInStock: 0,
        numReviews: 0,
        description: 'Описание товара...',
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Обновить товар
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response) => {
    const {name, price, description, image, brand, category, countInStock} = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.image = image || product.image;
        product.brand = brand || product.brand;
        product.category = category || product.category;
        product.countInStock = countInStock || product.countInStock;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Товар не найден');
    }
};