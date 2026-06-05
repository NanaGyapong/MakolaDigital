import { Router } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/image", authenticate, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image provided" });

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

export default router;
