import express from "express";
const router = express.Router();
import { makePayment } from "../controllers/payment.controller";
import { requireAuth } from "../middleware/requireAuth";

router.post("/pay", requireAuth, makePayment);

export default router;
