# 🌍 Makola Digital — Africa's Marketplace

> Buy, Sell & Connect across Africa and the Diaspora  
> Products · Services · Jobs · Rentals

---

## Overview

Makola Digital is a full-stack marketplace platform built for African businesses and buyers — locally, continentally, and in the diaspora. Think Jiji + Tonaton + Airbnb + LinkedIn, built for Africa.

---

## Repository Structure

```
makola-digital/
├── frontend/               # Next.js web app
│   ├── app/                # App router (Next.js 14)
│   │   ├── page.jsx        # Homepage (MakolaDigital.jsx)
│   │   ├── listings/       # Browse & search
│   │   ├── listing/[id]/   # Single listing
│   │   ├── seller/[username]/ # Seller profile
│   │   ├── dashboard/      # Seller dashboard
│   │   └── auth/           # Login / Register
│   ├── components/
│   └── package.json
│
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── app.js          # Main app (makola_api.js)
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── jobs/
│   └── package.json
│
├── database/
│   └── makola_schema.sql   # Full PostgreSQL schema
│
├── mobile/                 # React Native (Phase 2)
│   └── (coming soon)
│
└── README.md
```

---

## Tech Stack

| Layer       | Technology                                          |
|-------------|-----------------------------------------------------|
| Frontend    | Next.js 14, React, Tailwind CSS                     |
| Mobile      | React Native (Expo) — Phase 2                       |
| Backend     | Node.js, Express.js                                 |
| Database    | PostgreSQL 16 + PostGIS (geo) + pg_trgm (search)    |
| Cache       | Redis (sessions, rate limits, listing cache)        |
| Images      | Cloudinary                                          |
| Real-time   | Socket.IO (messaging)                               |
| Payments GH | Paystack (Mobile Money + Card)                      |
| Payments AF | Flutterwave (NGN, KES, ZAR, etc.)                   |
| Payments 🌍 | Stripe (USD, GBP, EUR — diaspora)                   |
| Auth        | JWT + Refresh Tokens + Google OAuth                 |
| Email       | SendGrid / Nodemailer                               |
| Hosting     | AWS / GCP (API), Vercel (Frontend)                  |
| DevOps      | Docker, GitHub Actions CI/CD                        |

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Cloudinary account (free tier fine for dev)

### 1. Clone & setup
```bash
git clone https://github.com/yourusername/makola-digital
cd makola-digital
```

### 2. Database setup
```bash
createdb makola_db
psql makola_db < database/makola_schema.sql
```

### 3. Backend
```bash
cd backend
cp .env.example .env   # fill in your keys
npm install
npm run dev            # runs on :4000
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev            # runs on :3000
```

---

## Key Features (MVP)

- [x] Homepage UI (MakolaDigital.jsx)
- [x] Database schema (users, listings, orders, payments, reviews, messages)
- [x] Full API route map
- [x] Search with PostGIS geo-filtering + full-text search
- [x] Multi-payment gateway (Paystack, Flutterwave, Stripe)
- [x] Real-time messaging (Socket.IO)
- [ ] Frontend listing pages
- [ ] Seller dashboard
- [ ] Mobile Money integration (live keys)
- [ ] KYC document upload + review
- [ ] Admin moderation panel
- [ ] Mobile app (React Native)

---

## Revenue Model

| Stream              | Model                              |
|---------------------|------------------------------------|
| Listing fees        | Free basic, paid boost/feature     |
| Transaction fee     | 2–8% commission on completed sales |
| Pro seller plan     | GH₵ 150–500/month                  |
| Sponsored listings  | CPC or flat-rate placement         |
| Escrow service      | 1–2% fee on escrow-held payments   |

---

## Roadmap

| Phase | Timeline  | Focus                                              |
|-------|-----------|----------------------------------------------------|
| 1     | Month 1–2 | Design, brand, wireframes                          |
| 2     | Month 3–5 | MVP: listings, search, messaging, payments         |
| 3     | Month 6   | Beta launch Ghana — 100 pilot sellers              |
| 4     | Month 7–9 | Jobs, rentals, mobile app                          |
| 5     | Month 10+ | Nigeria, Kenya, diaspora (UK, US, Canada)          |

---

## ML/Data Science Opportunities (your superpower 🧠)

Since you're an ML engineer, you can build competitive advantages into the platform:

1. **Smart search ranking** — Train a ranking model on click/purchase data (better than keyword search)
2. **Fraud & scam detection** — Classify suspicious listings and flag them before they go live
3. **Price recommendation** — "Listings priced GH₵ 4,200 sell 3x faster in your category"
4. **Personalised feed** — Collaborative filtering for buyer recommendations
5. **Image quality scoring** — Auto-reject blurry/irrelevant listing images
6. **Demand forecasting** — Tell sellers what's trending in their city

---

## Contributing

Pull requests welcome. For major changes, open an issue first.

---

## License

MIT — built in Ghana 🇬🇭 for Africa 🌍
