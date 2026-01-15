import { Request, Response } from "express";
import Product from "../models/Product.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProductFilter {
  name?: { $regex: string; $options: string };
  category?: string;
  brand?: string;
  price?: { $gte?: number; $lte?: number };
}

// @desc    Получить все товары
// @route   GET /api/products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 6;
    const page = Number(req.query.page) || 1;

    const query: ProductFilter = {};

    if (req.query.search) {
      query.name = { $regex: String(req.query.search), $options: "i" };
    }

    if (req.query.category && req.query.category !== "all") {
      query.category = String(req.query.category);
    }

    if (req.query.brand && req.query.brand !== "all") {
      query.brand = String(req.query.brand);
    }

    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    const sort: Record<string, 1 | -1> = {};

    if (req.query.sortBy === "price-asc") {
      sort.price = 1;
    } else if (req.query.sortBy === "price-desc") {
      sort.price = -1;
    } else {
      sort.createdAt = -1;
    }

    const totalCount = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort(sort)
      .limit(limit)
      .skip(limit * (page - 1));

    res.json({
      products,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении товаров" });
  }
};

// @desc    Получить один товар по ID
// @route   GET /api/products/:id
export const getProductById = async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Товар не найден");
  }
};

// @desc    Удалить товар
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    if (product.image && !product.image.includes("sample.jpg")) {
      const absolutePath = path.resolve(
        __dirname,
        "../../",
        product.image.replace(/^\//, "")
      );

      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    }

    await product.deleteOne();
    res.json({ message: "Товар и изображение удалены" });
  } else {
    res.status(404);
    throw new Error("Товар не найден");
  }
};

// @desc    Создать товар
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: AuthRequest, res: Response) => {
  const { name, price, brand, category, description, countInStock, image } =
    req.body;

  const product = new Product({
    name: name || "Новый товар",
    price: price || 0,
    user: req.user?._id,
    image: image || "/images/sample.jpg",
    brand: brand || "Бренд",
    category: category || "Категория",
    countInStock: countInStock || 0,
    numReviews: 0,
    description: description || "Описание товара...",
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

// @desc    Обновить товар
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response) => {
  const { name, price, description, image, brand, category, countInStock } =
    req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    if (
      image &&
      product.image !== image &&
      !product.image.includes("sample.jpg")
    ) {
      const oldPath = path.resolve(
        __dirname,
        "../../",
        product.image.replace(/^\//, "")
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

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
    throw new Error("Товар не найден");
  }
};
