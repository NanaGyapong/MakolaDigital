// routes/recommendations.routes.js
import { Router } from "express";
import { body, query } from "express-validator";
import rateLimit from "express-rate-limit";
import { optionalAuth } from "../middleware/auth.js";
import * as recs from "../controllers/recommendations.controller.js";

const router = Router();

// 200 req/min (recs are cached, this is generous)
const recLimit = rateLimit({ windowMs: 60 * 1000, max: 200 });

// Optional auth — works for both logged-in and anonymous users
router.get("/",             recLimit, optionalAuth, recs.getForUser);
router.get("/trending",     recLimit, recs.getTrendingRecs);
router.get("/similar/:id",  recLimit, recs.getSimilar);
router.get("/explain",      optionalAuth, recs.explainRec);
router.post("/event",       optionalAuth, [
  body("listingId").isUUID(),
  body("event").isIn(["view","click","save","purchase","dismiss"]),
], recs.trackInteraction);

export default router;
