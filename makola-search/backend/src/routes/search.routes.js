// routes/search.routes.js
import { Router } from "express";
import { query, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import { search, suggest, trending, facets } from "../controllers/search.controller.js";

const router = Router();
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

// Rate limit: 200 searches per 15 min per IP
const searchLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });

const searchValidation = [
  query("q").optional().trim().isLength({ max: 200 }).withMessage("Query too long"),
  query("type").optional().isIn(["all","product","service","job","rental","vehicle"]),
  query("page").optional().isInt({ min: 1, max: 500 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("price_min").optional().isFloat({ min: 0 }).toFloat(),
  query("price_max").optional().isFloat({ min: 0 }).toFloat(),
  query("lat").optional().isFloat({ min: -90, max: 90 }).toFloat(),
  query("lng").optional().isFloat({ min: -180, max: 180 }).toFloat(),
  query("radius_km").optional().isFloat({ min: 1, max: 2000 }).toFloat(),
  query("sort").optional().isIn(["relevance","newest","price_asc","price_desc","rating","views","distance"]),
  query("currency").optional().isIn(["GHS","NGN","KES","ZAR","USD","GBP","EUR"]),
];

// GET /api/v1/search?q=iphone&type=product&city=Accra&price_max=10000
router.get("/", searchLimit, searchValidation, validate, search);

// GET /api/v1/search/suggest?q=iph
router.get("/suggest", searchLimit, [
  query("q").trim().isLength({ min: 2, max: 100 }),
], validate, suggest);

// GET /api/v1/search/trending
router.get("/trending", trending);

// GET /api/v1/search/facets?q=iphone
router.get("/facets", searchLimit, [
  query("q").optional().trim().isLength({ max: 200 }),
], validate, facets);

export default router;
