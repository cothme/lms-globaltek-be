import express from "express";
const router = express.Router();
import { makePayment } from "../controllers/payment.controller";

router.post("/pay", makePayment);

export default router;
