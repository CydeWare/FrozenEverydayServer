import express from "express";
import multer from "multer";
import path from "path";
import { getProducts, createProduct, getProductsBySearch, getProductsByPagination, getSortedProducts, getProductsByPaginationAndCategory } from "../controllers/product.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads/videos"); // Ensure absolute path
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 },});

// Serve static files (allow users to access uploaded videos)
router.use("/videos", express.static(path.join(process.cwd(), "uploads/videos")));

router.get("/", getProducts);
router.post("/", upload.single("video"), createProduct);
router.get("/search", getProductsBySearch);
router.get("/pagination", getProductsByPagination);
router.get("/sorted", getSortedProducts);
router.get("/pagination/category", getProductsByPaginationAndCategory);

export default router;
