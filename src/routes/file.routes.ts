import * as FileController from "../controllers/file.controller";
import express from "express";
const router = express.Router();

router.post("/upload", FileController.uploadFile);
router.post("/upload-pdf", FileController.uploadPdf);
router.post("/upload-video", FileController.uploadVideo);

export default router;
