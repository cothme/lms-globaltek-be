import multer, { Multer } from "multer";
import path from "path";
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import sharp from "sharp";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryFile extends Express.Multer.File {
  buffer: Buffer;
}
const storage = multer.memoryStorage();
export const upload: Multer = multer({ storage: storage });

export const uploadVideoToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file: CloudinaryFile = req.file as CloudinaryFile;
    if (!file) {
      return next(new Error("No file provided"));
    }

    // Ensure the uploaded file is a PDF
    if (file.mimetype !== "video/mp4") {
      return next(new Error("Only mp4 files are allowed"));
    }

    // Upload the PDF buffer to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto", // Automatically detect the resource type
        folder: "uploads/videos", // Optional folder in Cloudinary
      },
      (
        err: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (err) {
          console.error("Cloudinary upload error:", err);
          return next(err);
        }
        if (!result) {
          console.error("Cloudinary upload error: Result is undefined");
          return next(new Error("Cloudinary upload result is undefined"));
        }

        // Store the Cloudinary URL in req.body or req.file (depending on your needs)
        req.body.cloudinaryUrl = result.secure_url;

        // Continue to the next middleware or route handler
        next();
      }
    );

    // End the upload stream with the PDF buffer
    uploadStream.end(file.buffer);
  } catch (error) {
    console.error("Error in uploadPdfToCloudinary middleware:", error);
    next(error);
  }
};
