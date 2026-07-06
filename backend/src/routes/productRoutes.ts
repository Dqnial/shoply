import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductFilters,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { productSchema } from "../validators/productValidators.js";

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(protect, admin, validate(productSchema), createProduct);

router.get("/filters", getProductFilters);

router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, validate(productSchema), updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
