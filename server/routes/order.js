import express from "express";
// const { sendOrderEmail } = require("../controllers/orderController");
import { sendOrderEmail } from "../controllers/order.js";
const router = express.Router();

router.post("/", sendOrderEmail);

export default router;