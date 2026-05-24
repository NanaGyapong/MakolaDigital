// routes/listings.routes.js
import { Router } from "express";
import { body, query, validationResult } from "express-validator";
import multer from "multer";
import { authenticate } from "../middleware/auth.js";
import { requireSeller } from "../middleware/role.js";
import * as listings from "../controllers/listings.controller.js";

const router = Router();
const validate = (req, res, next) => {
  const e = validationResult(req);
  if (!e.isEmpty()) return res.status(400).json({ message: e.array()[0].msg });
  next();
};

// Multer config: memory storage, 10MB limit, images only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only images allowed"));
    cb(null, true);
  },
});

// Validation schemas
const createValidation = [
  body("type").isIn(["product","service","job","rental"]).withMessage("Invalid listing type"),
  body("title").trim().isLength({ min: 10, max: 200 }).withMessage("Title must be 10–200 characters"),
  body("description").trim().isLength({ min: 30, max: 5000 }).withMessage("Description must be 30–5000 characters"),
  body("country").notEmpty().withMessage("Country is required"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Invalid price"),
  body("priceCurrency").optional().isIn(["GHS","NGN","KES","ZAR","USD","GBP","EUR"]),
  body("tags").optional().isArray({ max: 10 }).withMessage("Max 10 tags"),
];

// ── Routes ───────────────────────────────────────────────────
router.get("/my", authenticate, requireSeller, listings.getMyListings);

router.post("/",
  authenticate, requireSeller,
  createValidation, validate,
  listings.createListing
);

router.patch("/:id",
  authenticate, requireSeller,
  [body("title").optional().trim().isLength({ min: 10, max: 200 })],
  validate,
  listings.updateListing
);

router.post("/:id/images",
  authenticate, requireSeller,
  upload.array("images", 8),
  listings.uploadImages
);

router.delete("/:id/images/:imageId",
  authenticate, requireSeller,
  listings.deleteImage
);

router.patch("/:id/images/reorder",
  authenticate, requireSeller,
  [body("imageIds").isArray({ min: 1 })],
  validate,
  listings.reorderImages
);

router.post("/:id/publish",
  authenticate, requireSeller,
  listings.publishListing
);

router.post("/:id/boost",
  authenticate, requireSeller,
  [body("days").optional().isInt({ min: 1, max: 30 })],
  validate,
  listings.boostListing
);

router.post("/:id/renew",
  authenticate, requireSeller,
  listings.renewListing
);

router.delete("/:id",
  authenticate, requireSeller,
  listings.deleteListing
);

export default router;
