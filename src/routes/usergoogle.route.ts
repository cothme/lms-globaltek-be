import express from "express";
import * as UserGoogleController from "../controllers/usergoogle.controller";

const router = express.Router();

router.post("/", UserGoogleController.addUserGoogle);

export default router;
