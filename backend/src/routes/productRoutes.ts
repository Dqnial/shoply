import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';
import {protect, admin} from '../middleware/authMiddleware.js';

const router = express.Router();

// Путь: /api/products
router.route('/')
    .get(getProducts) // Доступно всем
    .post(protect, admin, createProduct); // Только админ

// Путь: /api/products/:id
router.route('/:id')
    .get(getProductById) // Доступно всем
    .put(protect, admin, updateProduct) // Только админ
    .delete(protect, admin, deleteProduct); // Только админ

export default router;