import express from "express";
import { getVariants, getVariantsByProductID } from "../controllers/variant.js";

const router = express.Router();

router.get("/", getVariants);
router.get("/:id", getVariantsByProductID);

export default router;
