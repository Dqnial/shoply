import { Request, Response } from "express";
import mongoose, { QueryFilter } from "mongoose";
import Product, { IProduct } from "../models/Product.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseObjectId(param: string | string[] | undefined) {
  if (typeof param !== "string" || !mongoose.Types.ObjectId.isValid(param)) {
    return null;
  }
  return param;
}

// Regex-escapes user input before it reaches $regex — otherwise a crafted
// search string (nested quantifiers) can trigger catastrophic backtracking
// against these public, unauthenticated endpoints.
function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSearchQuery(search: unknown) {
  if (!search) return {};
  const pattern = escapeRegex(String(search));
  return {
    $or: [
      { name: { $regex: pattern, $options: "i" } },
      { brand: { $regex: pattern, $options: "i" } },
    ],
  };
}

const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

// Only ever unlink a file that (a) is actually inside uploads/ and (b) an
// upload we generated — never trust an admin-supplied path straight into
// fs.unlink, or a crafted "../../.env" value could delete an arbitrary file.
function resolveOwnedUploadPath(imagePath: string): string | null {
  if (!imagePath.startsWith("/uploads/")) return null;
  const resolved = path.resolve(__dirname, "../../", imagePath.slice(1));
  if (resolved !== UPLOADS_DIR && !resolved.startsWith(UPLOADS_DIR + path.sep)) {
    return null;
  }
  return resolved;
}

// @desc    Получить список уникальных категорий и брендов (зависимые фильтры)
// @route   GET /api/products/filters
// @access  Public
export const getProductFilters = async (req: Request, res: Response) => {
  try {
    const { category, brand, search } = req.query;

    const baseQuery: QueryFilter<IProduct> = buildSearchQuery(search);

    const categoryQuery = { ...baseQuery };
    if (brand && brand !== "all") {
      categoryQuery.brand = String(brand);
    }
    const categories = await Product.distinct("category", categoryQuery);

    const brandQuery = { ...baseQuery };
    if (category && category !== "all") {
      brandQuery.category = String(category);
    }
    const brands = await Product.distinct("brand", brandQuery);

    res.json({ categories, brands });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении фильтров" });
  }
};

// @desc    Получить все товары
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
  try {
    const parsedLimit = Number(req.query.limit);
    const parsedPage = Number(req.query.page);
    const limit =
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 6;
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    const query: QueryFilter<IProduct> = buildSearchQuery(req.query.search);

    if (req.query.category && req.query.category !== "all") {
      query.category = String(req.query.category);
    }

    if (req.query.brand && req.query.brand !== "all") {
      query.brand = String(req.query.brand);
    }

    // Number("") is 0 (finite!), so an empty-string param — the catalog's
    // default "no filter set" state — must be treated as absent *before*
    // the numeric conversion, or an unset price range silently becomes
    // "price is exactly 0" and matches nothing.
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    if (
      (minPrice !== undefined && Number.isFinite(minPrice)) ||
      (maxPrice !== undefined && Number.isFinite(maxPrice))
    ) {
      query.price = {};
      if (minPrice !== undefined && Number.isFinite(minPrice))
        query.price.$gte = minPrice;
      if (maxPrice !== undefined && Number.isFinite(maxPrice))
        query.price.$lte = maxPrice;
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
// @access  Public
export const getProductById = async (req: Request, res: Response) => {
  const id = parseObjectId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Неверный формат ID" });
  }

  const product = await Product.findById(id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Товар не найден" });
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
  const id = parseObjectId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Неверный формат ID" });
  }

  const { name, price, description, image, brand, category, countInStock } =
    req.body;
  const product = await Product.findById(id);

  if (product) {
    if (image && product.image !== image && !product.image.includes("sample.jpg")) {
      const oldPath = resolveOwnedUploadPath(product.image);
      if (oldPath) {
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          console.log(err);
        }
      }
    }

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (description !== undefined) product.description = description;
    if (image !== undefined) product.image = image;
    if (brand !== undefined) product.brand = brand;
    if (category !== undefined) product.category = category;
    if (countInStock !== undefined) product.countInStock = countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: "Товар не найден" });
  }
};

// @desc    Удалить товар
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response) => {
  const id = parseObjectId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Неверный формат ID" });
  }

  const product = await Product.findById(id);

  if (product) {
    if (product.image && !product.image.includes("sample.jpg")) {
      const absolutePath = resolveOwnedUploadPath(product.image);
      if (absolutePath) {
        try {
          await fs.unlink(absolutePath);
        } catch (err) {
          console.log(err);
        }
      }
    }

    await product.deleteOne();
    res.json({ message: "Товар и изображение удалены" });
  } else {
    res.status(404).json({ message: "Товар не найден" });
  }
};
