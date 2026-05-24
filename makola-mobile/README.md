# 📱 Makola Digital — Mobile App (React Native / Expo)

Africa's marketplace mobile app for iOS and Android.

## Project structure

```
makola-mobile/
├── App.js                          ← Root entry point
├── app.json                        ← Expo config
├── navigation/
│   ├── RootNavigator.js            ← Auth vs Main routing
│   ├── AuthStack.js                ← Login/Register/OTP/KYC
│   └── MainTabs.js                 ← Bottom tab navigator
├── screens/
│   ├── auth/
│   │   ├── OnboardingScreen.js     ← 3-slide intro
│   │   ├── LoginScreen.js          ← Email + Google login
│   │   ├── RegisterScreen.js       ← Account creation
│   │   ├── VerifyEmailScreen.js    ← 6-digit OTP
│   │   └── ForgotPasswordScreen.js ← Password reset
│   ├── main/
│   │   ├── HomeScreen.js           ← Feed, categories, listings
│   │   ├── ListingDetailScreen.js  ← Full listing + buy flow
│   │   ├── SearchScreen.js         ← Search + filters
│   │   ├── MessagesScreen.js       ← Conversation list
│   │   ├── ChatScreen.js           ← Real-time chat
│   │   ├── SavedScreen.js          ← Wishlist
│   │   └── ProfileScreen.js        ← User profile + menu
│   └── sell/
│       └── SellScreen.js           ← 5-step listing creator
├── components/
│   └── ListingCard.js              ← Reusable card component
└── lib/
    ├── theme.js                    ← Colors, spacing, typography
    ├── auth.js                     ← API service + axios interceptors
    └── store.js                    ← Zustand global state
```

## Screens built

| Screen | Description |
|--------|-------------|
| Onboarding | 3-slide intro with pagination dots |
| Login | Email/password + Google OAuth |
| Register | Buyer/seller type, all fields, password strength |
| Verify Email | 6-input OTP with paste support + countdown |
| Forgot Password | Email reset flow |
| Home | Feed with categories, tabs, search, pull-to-refresh |
| Listing Detail | Gallery, seller card, reviews, payment selector, buy CTA |
| Search | Live search with trending, type filters, results grid |
| Messages | Conversation list with unread badges |
| Chat | Real-time-style messages with auto-reply |
| Sell | 5-step listing wizard (type → details → price → photos → review) |
| Profile | Stats, full menu, logout |

## Setup & run

```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Build for production
npx eas build --platform all
```

## Environment variables

Create `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## Tech stack

| Library | Use |
|---------|-----|
| Expo SDK 51 | Build toolchain + native APIs |
| React Navigation 6 | Stack + Tab + Drawer navigation |
| Expo Secure Store | Encrypted token storage |
| Zustand | Lightweight global state |
| Axios | HTTP client with interceptors |
| Expo Image Picker | Photo uploads for listings |
| Expo Location | Geo-based search |
| Expo Notifications | Push notifications |

## Key features

- **Offline-ready** token refresh with SecureStore
- **Auto JWT refresh** via Axios interceptor (transparent to screens)
- **Dark theme** consistent with web app design system
- **Optimistic UI** for saves, messages, and actions
- **5-step sell flow** with image upload and price calculator
- **Real-time chat** UI with auto-reply simulation (connect Socket.IO)

## Next steps

- [ ] Connect real Socket.IO for live messages
- [ ] Add push notifications (Expo + FCM/APNs)  
- [ ] Integrate payment sheet (Paystack RN SDK)
- [ ] Add maps for location-based listing search
- [ ] Submit to App Store + Google Play

---
Built in 🇬🇭 for Africa 🌍
