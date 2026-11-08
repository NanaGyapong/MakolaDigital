# Makola Digital — iOS App Store Build Guide

## Prerequisites (do these once)
1. Buy Apple Developer account at developer.apple.com ($99/year)
2. Install Xcode from Mac App Store (needs a Mac)
3. OR use a Mac-in-cloud service like MacStadium / GitHub Actions

## Step 1 — Install dependencies (run on Mac)
```bash
npm install --legacy-peer-deps
```

## Step 2 — Build static export + add iOS platform
```bash
npm run build:static        # generates the 'out' folder
npx cap add ios             # creates the ios/ Xcode project (run once)
npx cap sync ios            # copies 'out' into the iOS project
```

## Step 3 — Open Xcode
```bash
npx cap open ios
```

In Xcode:
- Select your Team (Apple Developer account)
- Set Bundle Identifier: online.makoladigital.app
- Set Version: 1.0.0 / Build: 1
- Select "Any iOS Device (arm64)" as target

## Step 4 — App Store assets needed
- App icon: 1024×1024px PNG (no alpha/transparency) → place in ios/App/App/Assets.xcassets/AppIcon.appiconset/
- Screenshots: iPhone 6.9" (1320×2868px) and iPhone 6.5" (1242×2688px)
- Use the red brand color #E8001A, white background

## Step 5 — App Store Connect
1. Go to appstoreconnect.apple.com
2. New App → iOS → Bundle ID: online.makoladigital.app
3. Fill in:
   - Name: Makola Digital
   - Subtitle: Buy. Sell. Connect. (30 chars max)
   - Description: (see below)
   - Keywords: ghana,marketplace,buy,sell,accra,africa,classifieds,jobs,rentals
   - Privacy Policy URL: https://makoladigital.online/privacy
   - Support URL: https://makoladigital.online/contact

## App Store Description (copy-paste ready)
Makola Digital is Africa's trusted marketplace for buying, selling and connecting.

🛍️ PRODUCTS — Fashion, Electronics, Cars, Phones, Food & Agriculture, Beauty and more
🔧 SERVICES — Repairs, Cleaning, Tech, Events, Transport & Professional Services  
💼 JOBS — Full-time, Part-time, Contract, Internship and Remote opportunities
🏠 RENTALS — Apartments, Houses, Shortlets, Commercial & Office Space

Whether you're in Accra, Kumasi, Lagos or London — Makola Digital connects you to buyers and sellers across Africa and the diaspora.

✅ Free to list
✅ Verified sellers
✅ Direct messaging
✅ Photo & video listings
✅ Location-based search

Download free. Start buying or selling in minutes.

## Step 6 — Archive & Upload
In Xcode: Product → Archive → Distribute App → App Store Connect → Upload

## Step 7 — Submit for Review
In App Store Connect:
- Add screenshots
- Set pricing (Free)
- Submit for review (1-3 days)
- Set release to Manual

## Important: Dynamic routes
Next.js dynamic routes like /listing/[id] need special handling for static export.
If you get build errors, add this to your dynamic pages:
```js
export async function generateStaticParams() { return []; }
export const dynamic = 'force-static';
```

