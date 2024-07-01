import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { upload, uploadToCloudinary } from "../helpers/fileUpload";
import { uploadPdfToCloudinary } from "../helpers/pdfUpload";
import { uploadVideoToCloudinary } from "../helpers/videoUpload";

export const uploadFile: RequestHandler = (req, res, next) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return next(createHttpError(400, err));
    }

    uploadToCloudinary(req, res, async (err) => {
      if (err) {
        console.log(req.file);

        return next(createHttpError(400, err));
      }

      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Optionally, you can access Cloudinary URLs if needed
        const cloudinaryUrl: string = req.body.cloudinaryUrl;

        return res.status(200).json({ file: req.file, cloudinaryUrl });
      } catch (error) {
        next(error);
      }
    });
  });
};

export const uploadPdf: RequestHandler = (req, res, next) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return next(createHttpError(400, err));
    }

    uploadPdfToCloudinary(req, res, async (err) => {
      if (err) {
        console.log(req.file);

        return next(createHttpError(400, err));
      }

      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Optionally, you can access Cloudinary URLs if needed
        const cloudinaryUrl: string = req.body.cloudinaryUrl;

        return res.status(200).json({ file: req.file, cloudinaryUrl });
      } catch (error) {
        next(error);
      }
    });
  });
};

export const uploadVideo: RequestHandler = (req, res, next) => {
  upload.single("video")(req, res, async (err) => {
    if (err) {
      return next(createHttpError(400, err));
    }

    uploadVideoToCloudinary(req, res, async (err) => {
      if (err) {
        console.log(req.file);

        return next(createHttpError(400, err));
      }

      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Optionally, you can access Cloudinary URLs if needed
        const cloudinaryUrl: string = req.body.cloudinaryUrl;

        return res.status(200).json({ file: req.file, cloudinaryUrl });
      } catch (error) {
        next(error);
      }
    });
  });
};
