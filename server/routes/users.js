import { signin, signup, sign } from '../controllers/user.js';
import express from "express";

const router = express.Router();


router.post("/signin", signin);
router.post("/signup", signup);
router.post("/sign", sign);

export default router;
