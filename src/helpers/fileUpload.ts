import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Preserve original filename
  },
});

// const fileFilter = (
//   req: any,
//   file: { originalname: string },
//   cb: (arg0: Error | null, arg1: boolean | null) => void
// ) => {
//   const ext = path.extname(file.originalname).toLowerCase();
//   if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
//     return cb(new Error("Only images are allowed (png, jpg, jpeg)"));
//   }
//   cb(null, true);
// };

export const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB limit
});
