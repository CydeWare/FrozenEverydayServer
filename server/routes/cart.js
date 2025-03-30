import express from "express";
import { getCartItems, createCartItem, deleteCartItem, updateCartItem, getCartItemsByUserID } from "../controllers/cart.js";

const router = express.Router();

router.get("/", getCartItems);
router.get("/:id", getCartItemsByUserID);
router.post("/", createCartItem);
router.patch("/:id", updateCartItem);
router.delete("/:id", deleteCartItem);

export default router;