import express from "express";
// import mysql from "mysql2";
import cors from "cors";
import db from "./db.js";
import bodyParser from 'body-parser';
import productRoutes from "./routes/product.js";
import multer from "multer";
import fileRoutes from "./routes/file.js";
import variantRoutes from "./routes/variant.js";
import userRoutes from "./routes/users.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/order.js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
// app.use(express.json());
app.use(bodyParser.json({limit: "30mb", extended: true})); //We use limit since we will be sending images
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/", (req, res) => {
  res.send("<h1>Welcome to the server!</h1>");
});

app.use("/products", productRoutes);
app.use("/files", fileRoutes);
app.use("/variants", variantRoutes);
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);

const dirs = [
  path.join(__dirname, 'public'),
  path.join(__dirname, 'public', 'images'),
  path.join(__dirname, 'public', 'videos')
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = file.mimetype.startsWith('video/') ? 'videos' : 'images';
    cb(null, path.join(__dirname, 'public', fileType));
  },
  filename: (req, file, cb) => {
    // Use timestamp and original extension to avoid name conflicts
    const fileExt = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`);
  }
});

const upload = multer({ storage });

app.use('/images', express.static(path.join(__dirname, 'public', 'images'), {
  maxAge: '1d', // Cache for 1 day
  etag: true
}));



// ✅ Serve videos publicly (Make the folder accessible)
app.use("/videos", express.static("uploads/videos"));
app.use("*", (req, res) => {
  res.end(`<h1>Page not found 404</h1>`)
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("App is listening on port " + PORT);
})