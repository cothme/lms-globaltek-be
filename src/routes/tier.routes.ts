import express from "express";
const router = express.Router();
import * as TierController from "../controllers/tier.controller";

router.post("/create", TierController.createTier);
router.get("/", TierController.getTier);
router.patch("/:tierId", TierController.updateTier);

export default router;
