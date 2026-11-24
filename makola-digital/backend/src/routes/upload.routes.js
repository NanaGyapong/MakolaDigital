import { Router } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    cb(null, allowed.includes(file.mimetype));
  }
});

const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max for video
  fileFilter: (req, file, cb) => {
    const allowed = ["video/mp4", "video/quicktime", "video/webm"];
    cb(null, allowed.includes(file.mimetype));
  }
});

router.post("/image", authenticate, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image provided or invalid file type" });

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "makola-digital", resource_type: "image",  },
        (error, result) => error ? reject(error) : resolve(result)
      ).end(req.file.buffer);
    });

    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error("upload:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});


router.post("/video", authenticate, videoUpload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No video provided" });
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "makola-digital/videos", resource_type: "video" },
        (error, result) => error ? reject(error) : resolve(result)
      ).end(req.file.buffer);
    });
    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error("video upload:", err);
    res.status(500).json({ message: "Video upload failed" });
  }
});

export default router;
