import express from "express";
import { getFiles, getFilesByProductID, getFirstFiles } from "../controllers/file.js";

const router = express.Router();

router.get("/", getFiles);
router.get("/first", getFirstFiles);
router.get("/product/:id", getFilesByProductID);


export default router;
