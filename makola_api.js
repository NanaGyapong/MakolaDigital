// ============================================================
// MAKOLA DIGITAL — Express.js API v1.0
// Stack: Node.js · Express · PostgreSQL · Redis · JWT
// ============================================================

// ── PROJECT STRUCTURE ────────────────────────────────────────
//
// makola-api/
// ├── src/
// │   ├── config/
// │   │   ├── db.js          PostgreSQL pool (pg)
// │   │   ├── redis.js       Redis client (ioredis)
// │   │   ├── storage.js     Cloudinary config
// │   │   └── env.js         Environment variables
// │   ├── middleware/
// │   │   ├── auth.js        JWT verify middleware
// │   │   ├── role.js        Role guard (seller, admin)
// │   │   ├── upload.js      Multer + Cloudinary upload
// │   │   ├── rateLimit.js   express-rate-limit
// │   │   └── validate.js    Zod schema validation
// │   ├── routes/
// │   │   ├── auth.routes.js
// │   │   ├── users.routes.js
// │   │   ├── listings.routes.js
// │   │   ├── orders.routes.js
// │   │   ├── payments.routes.js
// │   │   ├── messages.routes.js
// │   │   ├── reviews.routes.js
// │   │   ├── search.routes.js
// │   │   └── admin.routes.js
// │   ├── controllers/       (one per route file)
// │   ├── services/          (business logic layer)
// │   ├── jobs/              (Bull queues)
// │   │   ├── email.job.js
// │   │   ├── notification.job.js
// │   │   └── listing-expire.job.js
// │   └── app.js
// ├── prisma/schema.prisma   (or use raw SQL from schema.sql)
// ├── .env.example
// └── package.json

// ── package.json (key dependencies) ─────────────────────────
const packageJson = {
  dependencies: {
    "express": "^4.19",
    "pg": "^8.11",                    // PostgreSQL client
    "ioredis": "^5.3",                // Redis
    "jsonwebtoken": "^9.0",           // JWT auth
    "bcryptjs": "^2.4",               // Password hashing
    "zod": "^3.22",                    // Validation
    "multer": "^1.4",                  // File uploads
    "cloudinary": "^2.0",             // Image storage
    "bull": "^4.12",                   // Job queues
    "nodemailer": "^6.9",             // Email
    "socket.io": "^4.7",              // Real-time messaging
    "cors": "^2.8",
    "helmet": "^7.1",
    "morgan": "^1.10",
    "express-rate-limit": "^7.2",
    "uuid": "^9.0",
    "slugify": "^1.6",
    "dotenv": "^16.3",
    "paystack-node": "^2.0",          // Paystack payment
    "flutterwave-node-v3": "^1.1",    // Flutterwave payment
    "stripe": "^14.0",                 // Stripe (diaspora)
  }
};

// ── src/app.js ───────────────────────────────────────────────
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import { Server as SocketIO } from "socket.io";
import { rateLimit } from "express-rate-limit";

import authRoutes     from "./routes/auth.routes.js";
import userRoutes     from "./routes/users.routes.js";
import listingRoutes  from "./routes/listings.routes.js";
import orderRoutes    from "./routes/orders.routes.js";
import paymentRoutes  from "./routes/payments.routes.js";
import messageRoutes  from "./routes/messages.routes.js";
import reviewRoutes   from "./routes/reviews.routes.js";
import searchRoutes   from "./routes/search.routes.js";
import adminRoutes    from "./routes/admin.routes.js";

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, { cors: { origin: process.env.CLIENT_URL } });

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Routes
app.use("/api/v1/auth",     authRoutes);
app.use("/api/v1/users",    userRoutes);
app.use("/api/v1/listings", listingRoutes);
app.use("/api/v1/orders",   orderRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/reviews",  reviewRoutes);
app.use("/api/v1/search",   searchRoutes);
app.use("/api/v1/admin",    adminRoutes);

// ── FULL API ROUTES REFERENCE ────────────────────────────────

const API_ROUTES = {

  // AUTH
  "POST /api/v1/auth/register":        "Register new user",
  "POST /api/v1/auth/login":           "Login → returns JWT",
  "POST /api/v1/auth/logout":          "Invalidate token",
  "POST /api/v1/auth/refresh":         "Refresh access token",
  "POST /api/v1/auth/verify-email":    "Verify email OTP",
  "POST /api/v1/auth/forgot-password": "Send password reset",
  "POST /api/v1/auth/reset-password":  "Reset with token",
  "POST /api/v1/auth/google":          "Google OAuth",

  // USERS
  "GET    /api/v1/users/me":           "Get own profile",
  "PATCH  /api/v1/users/me":           "Update profile",
  "GET    /api/v1/users/:username":    "Public seller profile",
  "POST   /api/v1/users/kyc":          "Submit KYC documents",
  "GET    /api/v1/users/me/saved":     "Get saved listings",
  "GET    /api/v1/users/me/stats":     "Seller analytics",

  // LISTINGS
  "GET    /api/v1/listings":           "List all (paginated, filtered)",
  "POST   /api/v1/listings":           "Create listing [seller]",
  "GET    /api/v1/listings/:id":       "Get single listing",
  "PATCH  /api/v1/listings/:id":       "Update listing [owner]",
  "DELETE /api/v1/listings/:id":       "Delete listing [owner]",
  "POST   /api/v1/listings/:id/images":"Upload images [owner]",
  "POST   /api/v1/listings/:id/save":  "Save/unsave listing",
  "POST   /api/v1/listings/:id/boost": "Boost listing (paid)",
  "POST   /api/v1/listings/:id/report":"Report listing",

  // SEARCH
  "GET /api/v1/search":                "Full-text + geo search",
  // query params: q, type, category, country, city, lat, lng, radius_km,
  //               price_min, price_max, currency, is_verified, sort, page, limit

  // ORDERS
  "POST   /api/v1/orders":             "Create order [buyer]",
  "GET    /api/v1/orders":             "List my orders",
  "GET    /api/v1/orders/:id":         "Get order detail",
  "PATCH  /api/v1/orders/:id/status":  "Update order status",
  "POST   /api/v1/orders/:id/dispute": "Open dispute",

  // PAYMENTS
  "POST /api/v1/payments/initiate":    "Start payment (Paystack/FW/Stripe)",
  "POST /api/v1/payments/verify":      "Verify payment reference",
  "POST /api/v1/payments/webhook/paystack":   "Paystack webhook",
  "POST /api/v1/payments/webhook/flutterwave":"Flutterwave webhook",
  "POST /api/v1/payments/webhook/stripe":     "Stripe webhook",

  // MESSAGES
  "GET  /api/v1/messages":             "List conversations",
  "POST /api/v1/messages":             "Start conversation",
  "GET  /api/v1/messages/:id":         "Get conversation messages",
  "POST /api/v1/messages/:id/send":    "Send message",

  // REVIEWS
  "POST /api/v1/reviews":              "Leave review [buyer, after order]",
  "GET  /api/v1/reviews/seller/:id":   "Get seller reviews",
  "POST /api/v1/reviews/:id/reply":    "Seller reply to review",

  // ADMIN
  "GET    /api/v1/admin/listings":     "All listings + moderation",
  "PATCH  /api/v1/admin/listings/:id": "Flag/approve listing",
  "GET    /api/v1/admin/users":        "All users",
  "PATCH  /api/v1/admin/users/:id/kyc":"Approve/reject KYC",
  "GET    /api/v1/admin/reports":      "Open reports queue",
  "GET    /api/v1/admin/stats":        "Platform analytics",
};

// ── SEARCH SERVICE (key logic) ────────────────────────────────
const searchListings = async ({ q, type, category, lat, lng, radius_km = 50,
  price_min, price_max, currency = "GHS", is_verified,
  sort = "relevance", page = 1, limit = 20 }) => {

  const offset = (page - 1) * limit;
  const params = [];
  let where = ["l.status = 'active'"];

  if (q) {
    params.push(q);
    where.push(`l.search_vector @@ plainto_tsquery('english', $${params.length})`);
  }
  if (type)     { params.push(type);     where.push(`l.type = $${params.length}`); }
  if (category) { params.push(category); where.push(`c.slug = $${params.length}`); }
  if (price_min){ params.push(price_min);where.push(`l.price >= $${params.length}`); }
  if (price_max){ params.push(price_max);where.push(`l.price <= $${params.length}`); }
  if (is_verified) where.push("sp.is_verified = true");

  // Geo filter
  if (lat && lng) {
    params.push(lat, lng, radius_km * 1000);
    where.push(`ST_DWithin(l.location, ST_MakePoint($${params.length-2}, $${params.length-1})::geography, $${params.length})`);
  }

  const orderBy = {
    relevance:  q ? `ts_rank(l.search_vector, plainto_tsquery('english', '${q}')) DESC` : "l.created_at DESC",
    newest:     "l.created_at DESC",
    price_asc:  "l.price ASC",
    price_desc: "l.price DESC",
    rating:     "avg_rating DESC",
  }[sort] || "l.created_at DESC";

  params.push(limit, offset);

  const sql = `
    SELECT l.id, l.title, l.slug, l.type, l.price, l.price_currency,
           l.price_label, l.location_text, l.is_featured,
           l.views_count, l.created_at,
           u.full_name AS seller_name,
           sp.business_name, sp.is_verified AS seller_verified,
           (SELECT url FROM listing_images WHERE listing_id = l.id AND is_primary LIMIT 1) AS image,
           COALESCE(AVG(r.rating),0)::numeric(3,1) AS avg_rating,
           COUNT(DISTINCT r.id) AS review_count,
           COUNT(*) OVER() AS total_count
    FROM listings l
    JOIN users u ON u.id = l.seller_id
    LEFT JOIN seller_profiles sp ON sp.user_id = l.seller_id
    LEFT JOIN categories c ON c.id = l.category_id
    LEFT JOIN reviews r ON r.listing_id = l.id
    WHERE ${where.join(" AND ")}
    GROUP BY l.id, u.full_name, sp.business_name, sp.is_verified
    ORDER BY l.is_featured DESC, ${orderBy}
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

  return sql; // In real code: return db.query(sql, params)
};

// ── PAYMENT SERVICE ──────────────────────────────────────────
const PaymentService = {
  async initiatePaystack({ amount, email, currency, orderId, callbackUrl }) {
    // POST https://api.paystack.co/transaction/initialize
    // Supports GHS mobile money, card
    return { provider: "paystack", authorization_url: "...", reference: "..." };
  },

  async initiateFlutterwave({ amount, currency, customer, orderId, redirectUrl }) {
    // POST https://api.flutterwave.com/v3/payments
    // Supports NGN, GHS, KES, ZAR and many African currencies
    return { provider: "flutterwave", link: "..." };
  },

  async initiateStripe({ amount, currency, orderId }) {
    // For diaspora (USD, GBP, EUR) card payments
    return { provider: "stripe", client_secret: "..." };
  },

  // Auto-select provider based on currency + country
  selectProvider(currency, country) {
    if (["GHS"].includes(currency))             return "paystack";
    if (["NGN","KES","ZAR","UGX"].includes(currency)) return "flutterwave";
    if (["USD","GBP","EUR"].includes(currency)) return "stripe";
    return "flutterwave"; // default
  },
};

// ── SOCKET.IO (real-time messaging) ─────────────────────────
io.use((socket, next) => {
  // Verify JWT on socket connect
  const token = socket.handshake.auth.token;
  // verifyJWT(token) → attach user to socket
  next();
});

io.on("connection", (socket) => {
  socket.on("join_conversation", (conversationId) => {
    socket.join(`conv:${conversationId}`);
  });
  socket.on("send_message", async ({ conversationId, body }) => {
    // Save to DB, then broadcast
    const message = { id: "...", body, sender_id: socket.user.id, created_at: new Date() };
    io.to(`conv:${conversationId}`).emit("new_message", message);
  });
  socket.on("disconnect", () => {});
});

export { app, httpServer, API_ROUTES, searchListings, PaymentService };

// ── .env.example ────────────────────────────────────────────
/*
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/makola_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary (images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payments
PAYSTACK_SECRET_KEY=sk_live_...
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
FROM_EMAIL=hello@makoladigital.com
*/

// ── SPA CATCH-ALL (MUST be last route, after all /api/* routes) ──────────────
const path = require('path');
const DIST = path.join(__dirname, 'makola-pwa', 'dist');

// Serve static files from the PWA build
app.use(express.static(DIST));

// For any route that doesn't match an API endpoint, serve index.html
// This lets React Router handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});
