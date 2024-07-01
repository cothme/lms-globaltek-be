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

export const uploadUserImageToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file: CloudinaryFile = req.file as CloudinaryFile;
    if (!file) {
      return next();
    }

    // Resize the image using sharp (optional)
    const resizedBuffer: Buffer = await sharp(file.buffer)
      .resize({ width: 400, height: 400 })
      .toBuffer();

    // Upload the resized image buffer to Cloudinary
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto", // Automatically detect the resource type
          folder: "uploads/user_pictures", // Optional folder in Cloudinary
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
      )
      .end(resizedBuffer); // End the upload stream with the resized image buffer
  } catch (error) {
    console.error("Error in uploadToCloudinary middleware:", error);
    next(error);
  }
};
